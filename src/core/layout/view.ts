import { GeminiSpec } from '../gemini.schema';
import { renderLayout } from './layout';
import { HiGlassSpec } from '../higlass.schema';
import { downstreamSpecAssignments } from '../utils/spec-preprocess';

export function renderView(gm: GeminiSpec, setHg: (hg: HiGlassSpec) => void) {
    downstreamSpecAssignments(gm);
    renderLayout(gm, setHg);
}
