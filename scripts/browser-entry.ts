// Browser bundle of the LLM pipeline + validator, for in-browser testing against BizRouter (no renderer).
export { planDeck, fillSlides, buildSpec, fixSlide, reviewSlide, distillRules } from '../engine/llm/pipeline.ts';
export { chat, extractJson, listModels } from '../engine/llm/provider.ts';
export { validateSpec } from '../engine/renderer/validate.ts';
export * as prompts from '../engine/llm/prompts.ts';
export { generateImages, imageTargets, buildImagePrompt } from '../engine/llm/images.ts';
export { fillSlideRich, fixSlideRich, richSystem, parseRich, sanitizeRich, kindForType, isRichTarget, warmRichCache, stripImageSrcs, carryImageSrcs, PLAN_PREMIUM_ADDON } from '../engine/llm/rich.ts';
export { EXEMPLARS, exemplarsFor } from '../engine/knowledge/exemplars.ts';
export { directDeck, applyDirection, directionBlock } from '../engine/llm/direct.ts';
export { writeDossier } from '../engine/llm/dossier.ts';
