import { GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_GENE_TRANSCRIPT: GoslingSpec = {
    alignment: 'overlay',
    xDomain: { chromosome: '3', interval: [142500000, 143000000] },
    data: {
        url: GOSLING_PUBLIC_DATA.transcript,
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
        displace: [
            { type: 'pile', boundingBox: { startField: 'start', endField: 'end' }, newField: 'row', maxRows: 15 }
        ],
        filter: [{ field: 'type', oneOf: ['gene'] }]
    },
    title: 'hg38 | Transcript (Max. 15 Rows)',
    tracks: [
        {
            dataTransform: {
                displace: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row',
                        maxRows: 15
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
                displace: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row',
                        maxRows: 15
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
                displace: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row',
                        maxRows: 15
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
                displace: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row',
                        maxRows: 15
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
                displace: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row',
                        maxRows: 15
                    }
                ],
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
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
                linePattern: { type: 'triangleRight', size: 5 }
            }
        },
        {
            dataTransform: {
                displace: [
                    {
                        type: 'pile',
                        boundingBox: { startField: 'start', endField: 'end' },
                        newField: 'row',
                        maxRows: 15
                    }
                ],
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
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
                linePattern: { type: 'triangleRight', size: 5 }
            }
        }
    ],
    row: { field: 'row', type: 'nominal' },
    color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#0072B2', '#D45E00'] },
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
    style: { outline: 'black' },
    width: 700,
    height: 500
};
