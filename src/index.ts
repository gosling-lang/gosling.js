import pkg from '../package.json';
import GoslingSchema from '../schema/gosling.schema.json';
import ThemeSchema from '../schema/theme.schema.json';

export const { name, version } = pkg;
export { GoslingSchema, ThemeSchema };
export type { GoslingSpec, TemplateTrackDef } from './core/gosling.schema';
export type { HiGlassSpec } from './core/higlass.schema';
export { GoslingTemplates } from './core/utils/template';
export type { Theme } from './core/utils/theme';

export { init } from './core/init';
export { compile } from './core/compile';
export { validateGoslingSpec } from './core/utils/validate';
export { GoslingComponent } from './core/gosling-component';
export type { GoslingRef } from './core/gosling-component';
export { embed } from './core/gosling-embed';
