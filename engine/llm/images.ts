/* Image stage: turn `image.prompt` on visual-heavy slides into real pictures (data URLs) via an OpenAI-compatible
   images endpoint (BizRouter: openai/gpt-image-2 → webp). Idempotent: slides that already have image.src are skipped. */
import type { ProviderConfig } from './provider.ts';
import type { DeckSpec, Slide } from '../renderer/types.ts';

export interface ImageOptions {
  max?: number;                 // max images per deck (cost/time bound). default 4
  model?: string;               // default openai/gpt-image-2
  quality?: 'low' | 'medium' | 'high';
  timeoutMs?: number;
  log?: (m: string) => void;
  onProgress?: (e: { done: number; total: number; slide?: string }) => void;
}

interface Target { slide: Slide; ref: { prompt?: string; alt?: string; src?: string }; role: 'cover' | 'hero' | 'section' | 'visual' | 'annot' | 'quote'; size: string; priority: number; apply?: (src: string) => void }

/** Custom (premium) slides carry <img data-image="prompt" …> placeholders; each becomes a target whose result is written back into the HTML. */
function customImageTargets(s: Slide): Target[] {
  const b: any = s.body; if (b.type !== 'custom' || typeof b.html !== 'string') return [];
  const out: Target[] = []; const re = /<img\b([^>]*?)>/gi; let m: RegExpExecArray | null; let k = 0;
  while ((m = re.exec(b.html)) && k < 2) {
    const attrs = m[1]; if (!/data-image=/.test(attrs) || /\ssrc=/.test(attrs)) continue;
    const prompt = (attrs.match(/data-image="([^"]*)"/) || [])[1] || ''; if (!prompt.trim()) continue;
    const ratio = (attrs.match(/data-ratio="([^"]*)"/) || [])[1] || '';
    const before = b.html.slice(0, m.index); const inBackdrop = /class="[^"]*\bbackdrop\b[^"]*"[^>]*>\s*$/.test(before.slice(-400)) || /\bbackdrop\b/.test(attrs);
    const size = ratio === '1:1' ? '1024x1024' : ratio === '3:4' ? '1024x1536' : (ratio === '16:9' || ratio === '4:3' || inBackdrop) ? '1536x1024' : '1024x1024';
    const tag = m[0]; const ref = { prompt, alt: (attrs.match(/alt="([^"]*)"/) || [])[1] || '' };
    out.push({ slide: s, ref, role: inBackdrop ? 'hero' : 'visual', size, priority: inBackdrop ? 2 : 5, apply: (src: string) => { b.html = b.html.replace(tag, tag.replace(/<img\b/, `<img src="${src}"`)); } });
    k++;
  }
  return out;
}

/** Slides whose look depends on a picture. Priority: hero/cover first (full-bleed), then section/quote/visual. */
export function imageTargets(spec: DeckSpec): Target[] {
  const out: Target[] = [];
  for (const s of spec.slides) {
    const b: any = s.body;
    const want = (ref: any, role: Target['role'], size: string, priority: number) => {
      if (!ref || ref.src || !(ref.prompt || ref.alt)) return;
      out.push({ slide: s, ref, role, size, priority });
    };
    switch (b.type) {
      case 'cover':
        if ((b.visual === 'photo' || b.visual === 'art' || !b.visual) && !b.image) b.image = { prompt: `${spec.meta.title || ''} — 주제를 상징하는 장면`, alt: spec.meta.title || '' };
        if (b.image) want(b.image, b.visual === 'photo' ? 'cover' : 'visual', b.visual === 'photo' ? '1536x1024' : '1024x1024', 0); break;
      case 'image-hero': want(b.image, 'hero', '1536x1024', 1); break;
      case 'annotated-image': want(b.image, 'annot', '1536x1024', 2); break;
      case 'section': want(b.image, 'section', '1024x1024', 3); break;
      case 'quote': want(b.image, 'quote', '1024x1024', 4); break;
      case 'bullets-visual': if (b.visual?.kind === 'image') want(b.visual.image, 'visual', '1024x1024', 5); break;
      case 'question': want(b.image, 'visual', '1536x1024', 6); break;
      case 'custom': out.push(...customImageTargets(s)); break;
    }
  }
  return out.sort((a, b) => a.priority - b.priority);
}

const STYLE = '사진처럼 사실적인 고해상도 이미지, 시네마틱 자연광, 깊이감 있는 구도, 차분한 색감. 글자·숫자·로고·워터마크·말풍선 없음. 사람 얼굴은 클로즈업하지 않음.';
const ROLE_HINT: Record<Target['role'], string> = {
  cover: '발표 표지 배경용. 왼쪽 아래에 글자가 놓이므로 왼쪽은 단순하고 어둡게, 시각적 초점은 오른쪽.',
  hero: '화면 전체를 채우는 배경 사진. 아래쪽에 글자가 놓이므로 아래 1/3은 단순하게.',
  annot: '설명 핫스팟을 올릴 장면 사진. 주요 대상이 중앙에 크게, 배경은 단순하게.',
  section: '섹션 간지 보조 이미지. 상징적이고 여백이 있는 구도.',
  quote: '인용 장 보조 이미지. 분위기 중심, 주제가 은근히 드러나는 장면.',
  visual: '본문 옆 보조 이미지. 주제를 직관적으로 보여주는 장면, 중앙 구도.',
};

export function buildImagePrompt(t: Target, spec: DeckSpec): string {
  const base = (t.ref.prompt || t.ref.alt || '').trim();
  const topic = spec.meta.title ? `발표 주제: ${spec.meta.title}.` : '';
  return `${base}. ${ROLE_HINT[t.role]} ${topic} ${STYLE}`.replace(/\s+/g, ' ').trim();
}

async function generateOne(cfg: ProviderConfig, prompt: string, size: string, opt: ImageOptions): Promise<string> {
  const url = (cfg.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '') + '/images/generations';
  const body = { model: opt.model || 'openai/gpt-image-2', prompt, size, quality: opt.quality || 'low', output_format: 'webp', output_compression: 60, n: 1 };
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), opt.timeoutMs || 90000);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.apiKey}` }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) throw new Error(`images ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const item = data.data?.[0];
    if (item?.b64_json) return `data:image/${data.output_format || 'webp'};base64,${item.b64_json}`;
    if (item?.url) return item.url;
    throw new Error('images: empty result');
  } finally { clearTimeout(timer); }
}

/** Fill image.src for up to `max` targets, in parallel. Never throws for a single failure (the renderer falls back to themed art). */
export async function generateImages(spec: DeckSpec, cfg: ProviderConfig, opt: ImageOptions = {}): Promise<{ generated: number; failed: string[] }> {
  const targets = imageTargets(spec).slice(0, opt.max ?? 4);
  const failed: string[] = []; let done = 0;
  opt.onProgress?.({ done: 0, total: targets.length });
  await Promise.all(targets.map(async t => {
    const prompt = buildImagePrompt(t, spec);
    const t0 = Date.now();
    try {
      t.ref.src = await generateOne(cfg, prompt, t.size, opt);
      if (t.apply) t.apply(t.ref.src);
      opt.log?.(`[image ${t.slide.id}/${t.role}] ${Date.now() - t0}ms ${(t.ref.src.length / 1024).toFixed(0)}KB`);
    } catch (e: any) { failed.push(`${t.slide.id}: ${String(e?.message || e).slice(0, 120)}`); opt.log?.(`[image ${t.slide.id}] failed: ${e?.message}`); }
    done++; opt.onProgress?.({ done, total: targets.length, slide: t.slide.id });
  }));
  return { generated: targets.length - failed.length, failed };
}
