// Browser bundle of the LLM pipeline + validator, for in-browser testing against BizRouter (no renderer).
export { planDeck, fillSlides, buildSpec, fixSlide, reviewSlide, distillRules } from '../engine/llm/pipeline.ts';
export { chat, extractJson, listModels } from '../engine/llm/provider.ts';
export { validateSpec } from '../engine/renderer/validate.ts';
export * as prompts from '../engine/llm/prompts.ts';
