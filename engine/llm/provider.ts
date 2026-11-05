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
  /** 'off' (default): no extended thinking — Claude 5.5 models otherwise burn thousands of hidden tokens per call (slow, truncated output). 'auto': leave the provider default. */
  thinking?: 'off' | 'auto';
}

/* Claude 5.5 via OpenAI-compatible gateways: the thinking switch differs per model (haiku: {type:'disabled'}, sonnet/opus/fable: {type:'between_tools'}).
   We try the model-appropriate one first and fall back to the other on a 400 that mentions thinking. */
function thinkingOffVariants(model: string): any[] {
  const m = model.toLowerCase();
  if (!/anthropic|claude/.test(m)) return [];
  const a = { type: 'between_tools' }, b = { type: 'disabled' };
  return /haiku|opus|claude-4|-4\.|4-5|4\.5|sonnet-4/.test(m) ? [b, a] : [a, b];
}

export interface ChatOptions { system?: string; messages: ChatMessage[]; maxTokens?: number; temperature?: number; json?: boolean }
export interface ChatResult { text: string; model: string; usage?: { input?: number; output?: number }; ms: number; finish?: string; truncated?: boolean }
interface RawResult { text: string; finish?: string; usage?: { input?: number; output?: number } }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function chat(cfg: ProviderConfig, opt: ChatOptions): Promise<ChatResult> {
  const models = [cfg.model, ...(cfg.fallbackModels || [])];
  let lastErr: any = null;
  for (const model of models) {
    for (let attempt = 0; attempt <= (cfg.maxRetries ?? 2); attempt++) {
      const t0 = Date.now();
      try {
        const r = cfg.kind === 'anthropic' ? await callAnthropic(cfg, model, opt) : await callOpenAI(cfg, model, opt);
        const truncated = r.finish === 'length' || r.finish === 'max_tokens';
        if (truncated && opt.json !== false && attempt === 0 && (opt.maxTokens || 8000) < 32000) {
          // retry once with a bigger budget and an explicit compactness nudge before falling back to the next model
          opt = { ...opt, maxTokens: Math.min(32000, (opt.maxTokens || 8000) * 2), messages: [...opt.messages, { role: 'user', content: '(출력이 잘렸다. 같은 내용을 들여쓰기 없는 compact JSON으로, 설명 문장은 더 짧게 다시 출력하라.)' }] };
          lastErr = new Error('truncated'); continue;
        }
        return { text: r.text, model, ms: Date.now() - t0, finish: r.finish, usage: r.usage, truncated };
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

async function callAnthropic(cfg: ProviderConfig, model: string, opt: ChatOptions): Promise<RawResult> {
  const url = (cfg.baseUrl || 'https://api.anthropic.com').replace(/\/$/, '') + '/v1/messages';
  const body: any = { model, max_tokens: opt.maxTokens || 8000, messages: opt.messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: toAnthropicContent(m.content) })) };
  const sys = [opt.system, ...opt.messages.filter(m => m.role === 'system').map(m => typeof m.content === 'string' ? m.content : '')].filter(Boolean).join('\n\n');
  if (sys) body.system = sys;
  if (opt.temperature != null) body.temperature = opt.temperature;
  const res = await withTimeout(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) }, cfg.timeoutMs || 180000);
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return { text: (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join(''), finish: data.stop_reason, usage: { input: data.usage?.input_tokens, output: data.usage?.output_tokens } };
}

async function callOpenAI(cfg: ProviderConfig, model: string, opt: ChatOptions): Promise<RawResult> {
  const url = (cfg.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '') + '/chat/completions';
  const messages: any[] = [];
  if (opt.system) messages.push({ role: 'system', content: opt.system });
  for (const m of opt.messages) messages.push({ role: m.role, content: toOpenAIContent(m.content) });
  const body: any = { model, messages, max_tokens: opt.maxTokens || 8000, stream: false };
  if (opt.temperature != null) body.temperature = opt.temperature;
  const variants = cfg.thinking === 'auto' ? [undefined] : [...thinkingOffVariants(model), undefined];
  let res: Response | null = null; let lastText = '';
  for (let vi = 0; vi < variants.length; vi++) {
    const v = variants[vi]; const b = { ...body }; if (v) b.thinking = v; else delete b.thinking;
    res = await withTimeout(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.apiKey}` }, body: JSON.stringify(b) }, cfg.timeoutMs || 180000);
    if (res.ok) break;
    lastText = (await res.text()).slice(0, 300);
    const thinkingRejected = res.status === 400 && /thinking|reasoning/i.test(lastText) && vi < variants.length - 1;
    if (!thinkingRejected) throw new Error(`openai-compat ${res.status}: ${lastText}`);
  }
  if (!res || !res.ok) throw new Error(`openai-compat ${res?.status}: ${lastText}`);
  const data = await res.json();
  if (data.error) throw new Error(`openai-compat error: ${JSON.stringify(data.error).slice(0, 300)}`);
  const ch = data.choices?.[0];
  const c = ch?.message?.content;
  const usage = { input: data.usage?.prompt_tokens, output: data.usage?.completion_tokens };
  if (typeof c === 'string' && c.trim()) return { text: c, finish: ch?.finish_reason, usage };
  if (Array.isArray(c)) return { text: c.map((p: any) => p.text || '').join(''), finish: ch?.finish_reason, usage };
  // some gateways put the answer in reasoning_content when the visible content is empty
  const rc = ch?.message?.reasoning_content; if (typeof rc === 'string' && rc.trim()) return { text: rc, finish: ch?.finish_reason, usage };
  throw new Error(`empty completion (finish=${ch?.finish_reason || '?'})`);
}

/** Extract the first JSON object/array from an LLM reply (handles ```json fences and leading prose). */
export function extractJson<T = any>(text: string): T {
  let t = (text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim(); else t = t.replace(/^```(?:json)?\s*/i, '');
  const start = Math.min(...['{', '['].map(ch => { const i = t.indexOf(ch); return i < 0 ? Infinity : i; }));
  if (start === Infinity) throw new Error('no JSON in reply: ' + JSON.stringify(t.slice(0, 160)));
  t = t.slice(start);
  // trim trailing garbage after the last closing bracket
  const end = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
  t = t.slice(0, end + 1);
  try { return JSON.parse(t); } catch (e) {
    // light repairs: trailing commas, then a truncated-tail close attempt
    const repaired = t.replace(/,\s*([}\]])/g, '$1');
    try { return JSON.parse(repaired); } catch (e2) {
      const closed = closeTruncatedJson(repaired);
      try { return JSON.parse(closed); } catch { throw new Error('JSON parse failed: ' + String((e2 as any)?.message).slice(0, 80) + ' | tail=' + JSON.stringify(t.slice(-120))); }
    }
  }
}

/** Best-effort close of a JSON text cut mid-stream: drop the dangling partial value and close open brackets. */
export function closeTruncatedJson(t: string): string {
  // cut back to the last complete value boundary
  let cut = Math.max(t.lastIndexOf('},'), t.lastIndexOf('],'), t.lastIndexOf('"},'), t.lastIndexOf('}\n'));
  if (cut < t.length * 0.5) cut = t.length; else cut += 1;
  let s = t.slice(0, cut).replace(/,\s*$/, '');
  const stack: string[] = []; let inStr = false, escp = false;
  for (const ch of s) {
    if (inStr) { if (escp) escp = false; else if (ch === '\\') escp = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true; else if (ch === '{') stack.push('}'); else if (ch === '[') stack.push(']'); else if (ch === '}' || ch === ']') stack.pop();
  }
  if (inStr) s += '"';
  s = s.replace(/,\s*$/, '').replace(/:\s*$/, ':null');
  while (stack.length) s += stack.pop();
  return s;
}

export async function listModels(cfg: ProviderConfig): Promise<string[]> {
  if (cfg.kind === 'anthropic') {
    const res = await fetch((cfg.baseUrl || 'https://api.anthropic.com').replace(/\/$/, '') + '/v1/models', { headers: { 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01' } });
    const d = await res.json(); return (d.data || []).map((m: any) => m.id);
  }
  const res = await fetch((cfg.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '') + '/models', { headers: { authorization: `Bearer ${cfg.apiKey}` } });
  const d = await res.json(); return (d.data || []).map((m: any) => m.id);
}
