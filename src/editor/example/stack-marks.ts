import { GoslingSpec } from '../../';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_STACK: GoslingSpec = {
    title: 'Mark Stacking',
    subtitle: 'Replace marks to address visual overlaps using `stack` options',
    spacing: 1,
    centerRadius: 0.8,
    xDomain: { chromosome: '17', interval: [43080000, 43120000] },
    views: [
        {
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: [
                            'sample 1',
                            'sample 2',
                            'sample 3',
                            'sample 4',
                            'sample 5',
                            'sample 6',
                            'sample 7',
                            'sample 8'
                        ]
                    },
                    dataTransform: {
                        filter: [{ field: 'peak', inRange: [0, 0.001] }]
                    },
                    stack: { direction: 'orthogonal' },
                    mark: 'rect',
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    color: { value: '#FF6205' },
                    stroke: { value: 'white' },
                    strokeWidth: { value: 0.3 },
                    width: 700,
                    height: 40
                }
            ]
        },
        {
            tracks: [
                {
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=clinvar-beddb',
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
                    },
                    stack: { direction: 'orthogonal', padding: 3.5 },
                    mark: 'point',
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    size: { value: 3 },
                    color: {
                        field: 'significance',
                        type: 'nominal',
                        domain: [
                            'Pathogenic',
                            'Pathogenic/Likely_pathogenic',
                            'Likely_pathogenic',
                            'Uncertain_significance',
                            'Likely_benign',
                            'Benign/Likely_benign',
                            'Benign'
                        ],
                        range: ['#CB3B8C', '#CB71A3', '#CB96B3', 'gray', '#029F73', '#5A9F8C', '#5A9F8C'],
                        legend: true
                    },
                    width: 700,
                    height: 260
                }
            ]
        },
        {
            tracks: [
                {
                    title: 'Likely Benign',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=clinvar-beddb',
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
                    },
                    dataTransform: {
                        filter: [{ field: 'significance', oneOf: ['Likely_benign'] }]
                    },
                    mark: 'point',
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    size: { value: 4 },
                    color: { value: '#029F73' },
                    stroke: { value: 'black' },
                    strokeWidth: { value: 1 },
                    opacity: { value: 0.8 },
                    width: 700,
                    height: 60
                },
                {
                    title: 'Likely Benign',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=clinvar-beddb',
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
                    },
                    dataTransform: {
                        filter: [{ field: 'significance', oneOf: ['Likely_benign'] }],
                        stack: [
                            {
                                boundingBox: { startField: 'start', endField: 'end', padding: 5 },
                                direction: 'parallel',
                                newField: 'a'
                            }
                        ]
                    },
                    mark: 'point',
                    x: { field: 'aStart', type: 'genomic' },
                    xe: { field: 'aEnd', type: 'genomic' },
                    // stack: { direction: 'parallel', padding: 3.5 },
                    // x: { field: 'start', type: 'genomic' },
                    // xe: { field: 'end', type: 'genomic' },
                    size: { value: 4 },
                    color: { value: '#029F73' },
                    stroke: { value: 'black' },
                    strokeWidth: { value: 1 },
                    opacity: { value: 0.8 },
                    width: 700,
                    height: 60
                }
            ]
        }
    ]
};
