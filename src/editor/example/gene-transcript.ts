import { GoslingSpec } from '../../core/gosling.schema';

export const EX_SPEC_GENE_TRANSCRIPT: GoslingSpec = {
    alignment: 'overlay',
    xDomain: { chromosome: '3', interval: [52168000, 52890000] },
    data: {
        url: 'https://cgap-higlass.com/api/v1/tileset_info/?d=transcripts_hg38',
        type: 'beddb',
        genomicFields: [
            { index: 1, name: 'start' },
            { index: 2, name: 'end' }
        ],
        valueFields: [
            { index: 5, name: 'strand', type: 'nominal' },
            { index: 3, name: 'name', type: 'nominal' }
        ]
    },
    dataTransform: {
        stack: [{ type: 'pile', boundingBox: { startField: 'start', endField: 'end' }, newField: 'row' }],
        filter: [{ field: 'type', oneOf: ['gene'] }]
    },
    tracks: [
        {
            dataTransform: {
                stack: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row'
                    }
                ],
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
            },
            mark: 'triangleRight',
            x: {
                field: 'end',
                type: 'genomic',
                axis: 'top'
            },
            xe: undefined,
            size: { value: 15 }
        },
        {
            dataTransform: {
                stack: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row'
                    }
                ],
                filter: [{ field: 'type', oneOf: ['gene'] }]
            },
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            x: {
                field: 'start',
                type: 'genomic'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            style: {
                dy: -10
            }
        },
        {
            dataTransform: {
                stack: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row'
                    }
                ],
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
            },
            mark: 'triangleLeft',
            x: {
                field: 'start',
                type: 'genomic'
            },
            size: { value: 15 },
            style: { align: 'right' }
        },
        {
            dataTransform: {
                stack: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row'
                    }
                ],
                filter: [{ field: 'type', oneOf: ['exon'] }]
            },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            }
        },
        {
            dataTransform: {
                stack: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row'
                    }
                ],
                filter: [{ field: 'type', oneOf: ['gene'] }]
            },
            mark: 'rule',
            x: {
                field: 'start',
                type: 'genomic'
            },
            strokeWidth: { value: 3 },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            style: {
                // linePattern: { type: 'triangleRight', size: 5 }
            }
        }
    ],
    row: { field: 'row', type: 'nominal' },
    color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#7585FF', '#FF8A85'] },
    visibility: [
        {
            operation: 'less-than',
            measure: 'width',
            threshold: '|xe-x|',
            transitionPadding: 10,
            target: 'mark'
        }
    ],
    opacity: { value: 0.8 },
    width: 700,
    height: 400
};
