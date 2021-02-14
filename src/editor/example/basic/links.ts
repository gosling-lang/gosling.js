import { GoslingSpec } from '../../../core/gosling.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_LINKS: GoslingSpec = {
    layout: 'linear',
    arrangement: {
        direction: 'vertical',
        columnSizes: 800,
        rowGaps: [30, 0]
    },
    tracks: [
        {
            data: {
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                type: 'csv',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            overlay: [
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
            style: { circularLink: true }
        },
        {
            data: {
                url: EXAMPLE_DATASETS.region2,
                type: 'bed',
                genomicFields: [
                    { name: 'start', index: 1 },
                    { name: 'end', index: 2 }
                ]
            },
            overlay: [
                {
                    mark: 'link',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        linkingID: '1',
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
            }
        },
        {
            data: {
                url: EXAMPLE_DATASETS.region2,
                type: 'bed',
                genomicFields: [
                    { name: 'start', index: 1 },
                    { name: 'end', index: 2 }
                ]
            },
            mark: 'point',
            x: {
                field: 'start',
                type: 'genomic',
                domain: { chromosome: '4', interval: [145750000, 146100000] },
                linkingID: '1'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            y: { value: 190 },
            stretch: true,
            color: { value: 'steelblue' },
            opacity: { value: 0.05 }
        }
    ]
};
