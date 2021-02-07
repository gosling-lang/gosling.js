import pkg from '../package.json';
export type { GoslingSpec } from './core/gosling.schema';

export const name = pkg.name;
export const version = pkg.version;

export { init } from './core/init';
export { compile } from './core/compile';
export { validateGoslingSpec } from './core/utils/validate';

export { GoslingTrack } from './gosling-track';
export { AxisTrack } from './axis-track';
export { BrushTrack } from './higlass-brush-track';
export { CSVDataFetcher } from './higlass-csv-datafetcher';
export { RawDataFetcher } from './higlass-raw-datafetcher';
