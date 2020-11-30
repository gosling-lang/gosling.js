import { GeminidSpec } from './geminid.schema';
import { compileLayout } from './layout/layout';
import { HiGlassSpec } from './higlass.schema';
import { fixSpecDownstream } from './utils/spec-preprocess';
import { Size } from './utils/bounding-box';

export function compile(gm: GeminidSpec, setHg: (hg: HiGlassSpec, size: Size) => void) {
    // Fix track specs by looking into the root-level spec
    fixSpecDownstream(gm);

    // Make HiGlass models for individual tracks
    compileLayout(gm, setHg);
}
