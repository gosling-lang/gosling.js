import pkg from './package.json';
import GoslingSchema from '@gosling/schema/gosling.schema.json';
import ThemeSchema from '@gosling/schema/theme.schema.json';

export const { name, version } = pkg;
export { GoslingSchema, ThemeSchema };

export { GoslingTemplates } from '@gosling/core/utils/template';
export { init } from '@gosling/core/init';
export { compile } from '@gosling/core/compile';
export { validateGoslingSpec } from '@gosling/core/utils/validate';
export { GoslingComponent } from '@gosling/core/gosling-component';
export { embed } from '@gosling/core/gosling-embed';

export type { GoslingSpec, TemplateTrackDef } from '@gosling/schema';
export type { HiGlassSpec } from '@gosling/schema/higlass.schema';
export type { GoslingRef } from '@gosling/core/gosling-component';
export type { Theme } from '@gosling/core/utils/theme';
