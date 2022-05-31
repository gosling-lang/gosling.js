import GoslingSchema from '@gosling/schema/gosling.schema.json';
// TODO: generate theme schema again
// import ThemeSchema from '@gosling/schema/theme.schema.json';

export { name, version } from '../package.json';
export { GoslingSchema };
export {
    init,
    compile,
    embed,
    validateGoslingSpec,
    GoslingComponent,
    GoslingTemplates,
} from '@gosling/core';

export type { GoslingSpec, TemplateTrackDef } from '@gosling/schema';
export type { HiGlassSpec } from '@gosling/schema/higlass.schema';
export type { GoslingRef } from '@gosling/core';
export type { Theme } from '@gosling/theme';
