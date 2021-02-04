import { GoslingSpec, SuperposedTrack } from '../../../core/gosling.schema';
import { EXAMPLE_CYTOAND_HG38 } from '../cytoband-hg38';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_OVERVIEW_DEATIL: GoslingSpec = {
    layout: 'linear',
    arrangement: {
        direction: 'horizontal',
        wrap: 2,
        rowSizes: [55, 180, 180],
        rowGaps: [30, 0]
    },
    tracks: [
        {
            title: 'Overview',
            ...EXAMPLE_CYTOAND_HG38.tracks[0],
            x: {
                ...(EXAMPLE_CYTOAND_HG38.tracks[0] as SuperposedTrack).x,
                domain: { chromosome: '1' },
                linkingID: 'linking-overview'
            },
            superpose: [
                ...(EXAMPLE_CYTOAND_HG38.tracks[0] as SuperposedTrack).superpose,
                {
                    mark: 'brush',
                    x: { linkingID: 'linking-detail-1' },
                    color: { value: 'blue' },
                    opacity: { value: 0.2 }
                },
                {
                    mark: 'brush',
                    x: { linkingID: 'linking-detail-2' },
                    color: { value: 'red' },
                    opacity: { value: 0.2 }
                }
            ],
            span: 2
        },
        {
            title: 'Detail View 1',
            data: {
                url: EXAMPLE_DATASETS.geneAnnotation,
                type: 'bed',
                genomicFields: [
                    { index: 1, name: 'start' },
                    { index: 2, name: 'end' }
                ],
                valueFields: [
                    { index: 5, name: 'strand', type: 'nominal' },
                    { index: 3, name: 'name', type: 'nominal' }
                ],
                exonIntervalFields: [
                    { index: 12, name: 'start' },
                    { index: 13, name: 'end' }
                ]
            },
            superpose: [
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1' },
                        axis: 'top',
                        linkingID: 'linking-detail-1'
                    },
                    size: { value: 10 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['intron'] }] },
                    mark: 'rule',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    strokeWidth: { value: 2 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    style: {
                        curve: 'top'
                    }
                }
            ],
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { value: '#B54F4A' },
            width: 425,
            height: 120,
            style: {
                stroke: 'blue'
            }
        },
        {
            title: 'Detail View 2',
            data: {
                url: EXAMPLE_DATASETS.geneAnnotation,
                type: 'bed',
                genomicFields: [
                    { index: 1, name: 'start' },
                    { index: 2, name: 'end' }
                ],
                valueFields: [
                    { index: 5, name: 'strand', type: 'nominal' },
                    { index: 3, name: 'name', type: 'nominal' }
                ],
                exonIntervalFields: [
                    { index: 12, name: 'start' },
                    { index: 13, name: 'end' }
                ]
            },
            superpose: [
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [10000000, 15000000] },
                        axis: 'top',
                        linkingID: 'linking-detail-2'
                    },
                    size: { value: 10 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['intron'] }] },
                    mark: 'rule',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    strokeWidth: { value: 2 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    style: {
                        curve: 'top'
                    }
                }
            ],
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { value: '#B54F4A' },
            width: 425,
            height: 120,
            style: {
                stroke: 'red'
            }
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'rect',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [70000000, 100000000] },
                linkingID: 'linking-detail-1'
            },
            row: { field: 'sample', type: 'nominal' },
            // row: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative' },
            // stroke: {value: 'white'},
            // strokeWidth: {value: 1},
            width: 425,
            height: 180,
            style: {
                stroke: 'blue'
            }
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'rect',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [30000000, 65000000] },
                linkingID: 'linking-detail-2'
            },
            row: { field: 'sample', type: 'nominal' },
            // row: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative' },
            // stroke: {value: 'white'},
            // strokeWidth: {value: 1},
            width: 425,
            height: 180,
            style: {
                stroke: 'red'
            }
        }
    ]
};
