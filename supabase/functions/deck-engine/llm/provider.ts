/* LLM provider abstraction: Anthropic Messages API (native) or OpenAI-compatible chat completions (BizRouter etc.) */

export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string | ContentPart[] }
export type ContentPart = { type: 'text'; text: string } | { type: 'image'; mime: string; base64: string };

export interface ProviderConfig {
  kind: 'anthropic' | 'openai';
  apiKey: string;
  baseUrl?: string;          // openai: https://bizrouter.ai/api/v1 ; anthropic: https://api.anthropic.com
  model: string;
  fallbackModels?: string[];
  timeoutMs?: number;
  maxRetries?: number;
}

export interface ChatOptions { system?: string; messages: ChatMessage[]; maxTokens?: number; temperature?: number; json?: boolean }
export interface ChatResult { text: string; model: string; usage?: { input?: number; output?: number }; ms: number }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function chat(cfg: ProviderConfig, opt: ChatOptions): Promise<ChatResult> {
  const models = [cfg.model, ...(cfg.fallbackModels || [])];
  let lastErr: any = null;
  for (const model of models) {
    for (let attempt = 0; attempt <= (cfg.maxRetries ?? 2); attempt++) {
      const t0 = Date.now();
      try {
        const text = cfg.kind === 'anthropic' ? await callAnthropic(cfg, model, opt) : await callOpenAI(cfg, model, opt);
        return { text, model, ms: Date.now() - t0 };
      } catch (e: any) {
        lastErr = e;
        const msg = String(e?.message || e);
        const retriable = /429|5\d\d|timeout|abort|ECONN|overloaded/i.test(msg);
        if (!retriable) break; // try next model
        await sleep(800 * (attempt + 1));
      }
    }
  }
  throw lastErr || new Error('LLM call failed');
}

function toAnthropicContent(c: string | ContentPart[]) {
  if (typeof c === 'string') return c;
  return c.map(p => p.type === 'text' ? { type: 'text', text: p.text } : { type: 'image', source: { type: 'base64', media_type: p.mime, data: p.base64 } });
}
function toOpenAIContent(c: string | ContentPart[]) {
  if (typeof c === 'string') return c;
  return c.map(p => p.type === 'text' ? { type: 'text', text: p.text } : { type: 'image_url', image_url: { url: `data:${p.mime};base64,${p.base64}` } });
}

async function withTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); } finally { clearTimeout(t); }
}

async function callAnthropic(cfg: ProviderConfig, model: string, opt: ChatOptions): Promise<string> {
  const url = (cfg.baseUrl || 'https://api.anthropic.com').replace(/\/$/, '') + '/v1/messages';
  const body: any = { model, max_tokens: opt.maxTokens || 8000, messages: opt.messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: toAnthropicContent(m.content) })) };
  const sys = [opt.system, ...opt.messages.filter(m => m.role === 'system').map(m => typeof m.content === 'string' ? m.content : '')].filter(Boolean).join('\n\n');
  if (sys) body.system = sys;
  if (opt.temperature != null) body.temperature = opt.temperature;
  const res = await withTimeout(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) }, cfg.timeoutMs || 180000);
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
}

async function callOpenAI(cfg: ProviderConfig, model: string, opt: ChatOptions): Promise<string> {
  const url = (cfg.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '') + '/chat/completions';
  const messages: any[] = [];
  if (opt.system) messages.push({ role: 'system', content: opt.system });
  for (const m of opt.messages) messages.push({ role: m.role, content: toOpenAIContent(m.content) });
  const body: any = { model, messages, max_tokens: opt.maxTokens || 8000, stream: false };
  if (opt.temperature != null) body.temperature = opt.temperature;
  const res = await withTimeout(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.apiKey}` }, body: JSON.stringify(body) }, cfg.timeoutMs || 180000);
  if (!res.ok) throw new Error(`openai-compat ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const ch = data.choices?.[0];
  const c = ch?.message?.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map((p: any) => p.text || '').join('');
  throw new Error('empty completion');
}

/** Extract the first JSON object/array from an LLM reply (handles ```json fences and leading prose). */
export function extractJson<T = any>(text: string): T {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = Math.min(...['{', '['].map(ch => { const i = t.indexOf(ch); return i < 0 ? Infinity : i; }));
  if (start === Infinity) throw new Error('no JSON in reply');
  t = t.slice(start);
  // trim trailing garbage after the last closing bracket
  const end = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
  t = t.slice(0, end + 1);
  try { return JSON.parse(t); } catch (e) {
    // attempt light repairs: trailing commas
    const repaired = t.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(repaired);
  }
}

export async function listModels(cfg: ProviderConfig): Promise<string[]> {
  if (cfg.kind === 'anthropic') {
    const res = await fetch((cfg.baseUrl || 'https://api.anthropic.com').replace(/\/$/, '') + '/v1/models', { headers: { 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01' } });
    const d = await res.json(); return (d.data || []).map((m: any) => m.id);
  }
  const res = await fetch((cfg.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '') + '/models', { headers: { authorization: `Bearer ${cfg.apiKey}` } });
  const d = await res.json(); return (d.data || []).map((m: any) => m.id);
}
