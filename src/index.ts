import pkg from '../package.json';
export type { GoslingSpec } from './core/gosling.schema';

export const name = pkg.name;
export const version = pkg.version;

export { init } from './core/init';
export { compile } from './core/compile';
export { validateGoslingSpec } from './core/utils/validate';
