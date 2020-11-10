import { BasicSingleTrack, GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';
import { EXAMPLE_IDEOGRAM_TRACK } from './ideogram';

export const MULTIVEC_SPEC: Partial<BasicSingleTrack> = {
    data: {
        url: EXAMPLE_DATASETS.multivec,
        type: 'tileset'
    },
    metadata: {
        type: 'higlass-multivec',
        row: 'sample',
        column: 'position',
        value: 'peak',
        categories: ['sample 1']
    },
    dataTransform: { filter: [{ field: 'peak', oneOf: [0], not: true }] }
};

export const EXAMPLE_PERIPHERAL_PLOT: GeminiSpec = {
    layout: {
        type: 'linear',
        direction: 'horizontal',
        wrap: 3,
        columnSizes: [100, 600, 100],
        columnGaps: 2,
        rowSizes: [60, 120, 90],
        rowGaps: [60, 2]
    },
    tracks: [
        {
            title: 'Overview',
            ...EXAMPLE_IDEOGRAM_TRACK,
            superpose: [
                ...EXAMPLE_IDEOGRAM_TRACK.superpose,
                { mark: 'rect-brush', x: { linker: 'periphery-left' } },
                { mark: 'rect-brush', x: { linker: 'focus' }, color: { value: 'black' } },
                { mark: 'rect-brush', x: { linker: 'periphery-right' } }
            ],
            span: 3
        },
        {
            title: 'Context View',
            ...(MULTIVEC_SPEC as any),
            mark: 'bar',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 50000000] },
                linker: 'periphery-left',
                axis: 'top'
            },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#3875A3' },
            style: { outline: 'black' }
        },
        {
            title: 'Focus View',
            ...(MULTIVEC_SPEC as any),
            mark: 'line',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [50000000, 100000000] },
                axis: 'top',
                linker: 'focus'
            },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#3875A3' },
            style: { outline: 'black' }
        },
        {
            title: 'Context View',
            ...(MULTIVEC_SPEC as any),
            mark: 'bar',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [100000000, 150000000] },
                axis: 'top',
                linker: 'periphery-right'
            },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#3875A3' },
            style: { outline: 'black' }
        },
        {
            ...(MULTIVEC_SPEC as any),
            mark: 'point',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 50000000] },
                linker: 'periphery-left'
            },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#3875A3' },
            opacity: { value: 0.7 },
            style: { outline: 'black' }
        },
        {
            ...(MULTIVEC_SPEC as any),
            mark: 'line',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [50000000, 100000000] },
                linker: 'focus'
            },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#3875A3' },
            style: { outline: 'black' }
        },
        {
            ...(MULTIVEC_SPEC as any),
            mark: 'point',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [100000000, 150000000] },
                linker: 'periphery-right'
            },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#3875A3' },
            opacity: { value: 0.7 },
            style: { outline: 'black' }
        }
    ]
};
