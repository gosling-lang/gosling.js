import pkg from '../package.json';
export type { GeminidSpec } from './core/geminid.schema';

export const name = pkg.name;
export const version = pkg.version;

export { compile } from './core/compile';
export { validateGeminidSpec } from './core/utils/validate';

export { GeminidTrack } from './higlass-geminid-track';
export { CSVDataFetcher } from './higlass-csv-datafetcher';
export { RawDataFetcher } from './higlass-raw-datafetcher';
