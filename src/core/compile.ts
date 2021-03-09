import { GoslingSpec, PrGoslingSpec } from './gosling.schema';
import { compileLayout } from './layout/layout';
import { HiGlassSpec } from './higlass.schema';
import { processSpec } from './utils/spec-process';
import { Size } from './utils/bounding-box';

export function compile(spec: GoslingSpec, setHg: (hg: HiGlassSpec, size: Size) => void) {
    // Process the spec to make it easier to be used in Gosling.js internally.
    processSpec(spec);

    // Make HiGlass models for individual tracks
    compileLayout(spec as PrGoslingSpec, setHg);

    // console.log('processedSpec', spec);
}
