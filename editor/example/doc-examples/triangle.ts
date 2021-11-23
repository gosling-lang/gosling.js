import { SingleTrack } from '@gosling.schema';
import type { GoslingSpec } from 'gosling.js';

import { HiGlass } from '../gene-annotation';

export const TRIANGLE: GoslingSpec = {
    ...HiGlass,
    tracks: HiGlass.tracks.filter((d: Partial<SingleTrack>) => d.mark!.includes('triangle')),
    title: 'Basic Marks: Triangles',
    subtitle: 'Tutorial Examples',
    width: 800,
    visibility: undefined
};
