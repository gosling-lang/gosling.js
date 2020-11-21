import pkg from '../package.json';
export type { GeminiSpec } from './core/gemini.schema';

export const name = pkg.name;
export const version = pkg.version;

export { compile } from './core/compile';
export { validateGeminiSpec } from './core/utils/validate';
