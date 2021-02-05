import { GoslingSpec, Track } from '../../../core/gosling.schema';
import { EXAMPLE_DATASETS } from './datasets';

// refer to the following for supporting zooming and panning in circular layouts:
// higlass/app/scripts/TrackRenderer.js

const commonMultivecSpec: Partial<Track> = {
    data: {
        url: EXAMPLE_DATASETS.multivec,
        type: 'multivec',
        row: 'sample',
        column: 'position',
        value: 'peak',
        bin: 16,
        categories: [
            'sample 1',
            'sample 2',
            'sample 3'
            // 'sample 4'
            // 'sample 5', 'sample 6', 'sample 7', 'sample 8',
            // 'sample 9', 'sample 10', 'sample 11', 'sample 12',
            // 'sample 13', 'sample 14', 'sample 15', 'sample 16',
            // 'sample 17', 'sample 18', 'sample 19', 'sample 20'
        ]
    }
};

const CIRCOS_LINE: Track = {
    ...commonMultivecSpec,
    mark: 'bar',
    x: {
        field: 'start',
        type: 'genomic',
        domain: { chromosome: '6' },
        linkingID: 'link-1'
    },
    xe: {
        field: 'end',
        type: 'genomic'
    },
    y: { field: 'peak', type: 'quantitative' },
    // row: { field: 'sample', type: 'nominal', grid: true },
    color: { field: 'sample', type: 'nominal', range: ['black', 'gray', 'lightgray'] },

    outerRadius: 140,
    innerRadius: 100,
    startAngle: 0,
    endAngle: 180
} as Track;

export const EXAMPLE_CIRCOS_STACKING: GoslingSpec = {
    layout: 'circular',
    arrangement: {
        direction: 'horizontal',
        wrap: 2,
        rowSizes: 300,
        columnSizes: 300,
        columnGaps: 0,
        rowGaps: 0
    },
    tracks: [
        { ...CIRCOS_LINE, innerRadius: 50, outerRadius: 140 },
        {
            ...CIRCOS_LINE,
            innerRadius: 50,
            outerRadius: 140,
            startAngle: 180,
            endAngle: 270,
            superposeOnPreviousTrack: true
        },
        {
            ...CIRCOS_LINE,
            innerRadius: 50,
            outerRadius: 100,
            startAngle: 270,
            endAngle: 340,
            superposeOnPreviousTrack: true
        },
        {
            ...CIRCOS_LINE,
            innerRadius: 50,
            outerRadius: 80,
            startAngle: 340,
            endAngle: 360,
            superposeOnPreviousTrack: true
        }
    ]
} as GoslingSpec;
