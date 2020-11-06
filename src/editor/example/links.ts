import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_LINKS: GeminiSpec = {
    layout: {
        type: 'linear',
        direction: 'vertical',
        gap: 0
    },
    tracks: [
        {
            data: {
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                type: 'csv',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            superpose: [
                {
                    mark: 'link',
                    x: {
                        field: 's1',
                        type: 'genomic',
                        domain: { chromosome: '1' },
                        axis: 'top'
                    },
                    xe: {
                        field: 'e1',
                        type: 'genomic'
                    },
                    x1: {
                        field: 's2',
                        type: 'genomic',
                        domain: { chromosome: '1' },
                        axis: 'top'
                    },
                    x1e: {
                        field: 'e2',
                        type: 'genomic'
                    }
                }
            ],
            color: { value: 'steelblue' },
            stroke: { value: 'steelblue' },
            opacity: { value: 0.1 },
            style: { circularLink: true },
            width: 1000,
            height: 320
        },
        {
            data: {
                url: EXAMPLE_DATASETS.region2,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
                genomicFields: [
                    { name: 'start', index: 1 },
                    { name: 'end', index: 2 }
                ]
            },
            superpose: [
                // {
                //     mark: 'rect',
                //     x: {
                //         field: 'start',
                //         type: 'genomic',
                //         domain: { chromosome: '1', interval: [19590000, 19630000] },
                //         axis: 'top'
                //     },
                //     xe: {
                //         field: 'end',
                //         type: 'genomic'
                //     },
                //     color: { value: '#F0F0F0' },
                //     opacity: { value: 0.1 },
                // },
                {
                    mark: 'link',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        // domain: { chromosome: '4', interval: [132600000, 132900000] },
                        linker: '1',
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    strokeWidth: { value: 1 }
                }
            ],
            color: { value: 'none' },
            stroke: { value: 'steelblue' },
            opacity: { value: 0.3 },
            style: {
                circularLink: true
            },
            width: 1000,
            height: 220
        },
        {
            data: {
                url: EXAMPLE_DATASETS.region2,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
                genomicFields: [
                    { name: 'start', index: 1 },
                    { name: 'end', index: 2 }
                ]
            },
            mark: 'point',
            x: {
                field: 'start',
                type: 'genomic',
                // domain: { chromosome: '4', interval: [132600000, 132900000] },
                domain: { chromosome: '4', interval: [144650000, 145100000] },
                linker: '1'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            y: { value: 190 },
            stretch: true,
            color: { value: 'steelblue' },
            opacity: { value: 0.05 },
            width: 1000,
            height: 190
        }
    ]
};
