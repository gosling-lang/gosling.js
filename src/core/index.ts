import pkg from '../../package.json';

export const name = pkg.name;
export const version = pkg.version;

// export type { GeminiSpec } from './gemini.schema';
export { compile } from './compile';
export { validateGeminiSpec } from './utils/validate';
