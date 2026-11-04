/* Local end-to-end build with QA loop:
   tsx engine/build.ts brief.json outdir [--no-fix] [--review] [--max-fix=2]
   env: LLM_KIND=openai|anthropic LLM_API_KEY=... LLM_BASE_URL=https://bizrouter.ai/api/v1 LLM_MODEL=anthropic/claude-sonnet-5 LLM_FALLBACKS=a,b */
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { buildSpec, fixSlide, reviewSlide, type Brief, type Rule } from './llm/pipeline.ts';
import type { ProviderConfig } from './llm/provider.ts';
import { renderDeck } from './renderer/index.ts';
import { FONT_BASE64 } from './assets/font.ts';
import { qrSvg } from './qr.ts';

const [, , briefPath, outDir = 'out/build', ...flags] = process.argv;
if (!briefPath) { console.error('usage: tsx engine/build.ts brief.json outdir'); process.exit(1); }
const maxFix = parseInt((flags.find(f => f.startsWith('--max-fix=')) || '--max-fix=2').slice(10), 10);
const doFix = !flags.includes('--no-fix'); const doReview = flags.includes('--review');

const provider: ProviderConfig = {
  kind: (process.env.LLM_KIND as any) || 'openai', apiKey: process.env.LLM_API_KEY || process.env.BIZROUTER_API_KEY || process.env.ANTHROPIC_API_KEY || '',
  baseUrl: process.env.LLM_BASE_URL || (process.env.LLM_KIND === 'anthropic' ? 'https://api.anthropic.com' : 'https://bizrouter.ai/api/v1'),
  model: process.env.LLM_MODEL || 'anthropic/claude-sonnet-5', fallbackModels: (process.env.LLM_FALLBACKS || '').split(',').filter(Boolean),
};
if (!provider.apiKey) { console.error('LLM_API_KEY missing'); process.exit(1); }

const brief: Brief = JSON.parse(readFileSync(briefPath, 'utf8'));
const rulesPath = 'engine/knowledge/rules.json';
const rules: Rule[] = existsSync(rulesPath) ? JSON.parse(readFileSync(rulesPath, 'utf8')).filter((r: any) => r.active !== false) : [];
mkdirSync(outDir, { recursive: true });
const log = (m: string) => { console.log(m); appendFileSync(join(outDir, 'build.log'), m + '\n'); };

function render(spec: any, tag: string) {
  const res = renderDeck(spec, { fontBase64: FONT_BASE64, qr: qrSvg });
  mkdirSync(join(outDir, 'parts'), { recursive: true });
  writeFileSync(join(outDir, 'deck.html'), res.html);
  res.parts.forEach((p, i) => writeFileSync(join(outDir, 'parts', `slide-${String(i + 1).padStart(2, '0')}.html`), p));
  writeFileSync(join(outDir, `spec.${tag}.json`), JSON.stringify(spec, null, 2));
  return res;
}
function lint(): any[] {
  try { execSync(`node engine/qa/lint.js ${outDir} --static --sheet`, { stdio: 'pipe' }); } catch (e: any) { log('lint failed: ' + e.message); }
  return JSON.parse(readFileSync(join(outDir, 'lint.static.json'), 'utf8'));
}

(async () => {
  const t0 = Date.now();
  const { spec, plan, warnings } = await buildSpec(brief, { provider, rules, log, onProgress: e => log(`[${e.stage}] ${e.done ?? ''}/${e.total ?? ''} ${e.msg ?? ''}`) });
  writeFileSync(join(outDir, 'plan.json'), JSON.stringify(plan, null, 2));
  warnings.forEach(w => log('validate: ' + w));
  let res = render(spec, 'v1');
  log(`[render v1] ${spec.slides.length} slides, ${(res.html.length / 1048576).toFixed(2)}MB`);
  let report = lint();
  const feedback: any[] = [];
  for (let round = 1; doFix && round <= maxFix; round++) {
    const bad = report.filter(r => r.errors > 0 || r.issues.some((i: any) => i.code === 'SPARSE' && i.extra < 25));
    log(`[lint round ${round}] errors on ${bad.length} slides`);
    if (!bad.length) break;
    for (const r of bad) {
      const idx = r.n - 1; const s = spec.slides[idx];
      const issues = r.issues.filter((i: any) => i.sev === 'error' || i.code === 'SPARSE');
      feedback.push({ source: 'lint', round, slide: s.id, type: (s.body as any).type, issues });
      try { spec.slides[idx] = await fixSlide(s, issues, { provider, log }, spec.meta); } catch (e: any) { log(`fix ${s.id} failed: ${e.message}`); }
    }
    res = render(spec, `v${round + 1}`); report = lint();
  }
  if (doReview) {
    for (const r of report) {
      const shot = join(outDir, 'shots', r.file.replace('.html', '.static.jpg'));
      if (!existsSync(shot)) continue;
      try { const rv = await reviewSlide(readFileSync(shot).toString('base64'), spec.slides[r.n - 1], { provider, log }); feedback.push({ source: 'vision', slide: spec.slides[r.n - 1].id, type: (spec.slides[r.n - 1].body as any).type, review: rv }); log(`[review ${r.n}] score ${rv.score} issues ${rv.issues?.length || 0}`); } catch (e: any) { log(`review ${r.n} failed: ${e.message}`); }
    }
  }
  writeFileSync(join(outDir, 'spec.json'), JSON.stringify(spec, null, 2));
  if (feedback.length) appendFileSync('engine/knowledge/feedback.jsonl', feedback.map(f => JSON.stringify({ ...f, deck: spec.meta.title, at: new Date().toISOString() })).join('\n') + '\n');
  const errs = report.reduce((a, r) => a + r.errors, 0), warns = report.reduce((a, r) => a + r.warns, 0);
  log(`DONE in ${((Date.now() - t0) / 1000).toFixed(0)}s — ${spec.slides.length} slides, lint errors=${errs} warnings=${warns} → ${join(outDir, 'deck.html')}`);
})().catch(e => { console.error(e); process.exit(1); });
