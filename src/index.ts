import pkg from '../package.json';
import GoslingSchema from '../schema/gosling.schema.json';

export type { GoslingSpec } from './core/gosling.schema';
export type { HiGlassSpec } from './core/higlass.schema';
export type { Theme } from './core/utils/theme';
export { GoslingSchema };

export const name = pkg.name;
export const version = pkg.version;

export { init } from './core/init';
export { compile } from './core/compile';
export { validateGoslingSpec } from './core/utils/validate';
export { GoslingComponent } from './core/gosling-component';
export { embed } from './core/gosling-embed';
