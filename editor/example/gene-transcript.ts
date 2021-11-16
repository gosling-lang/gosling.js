import type { GoslingSpec } from 'gosling.js';
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
            { index: 0, name: 'chr', type: 'nominal' },
            { index: 5, name: 'strand', type: 'nominal' },
            { index: 3, name: 'name', type: 'nominal' },
            { index: 9, name: 'exon_start', type: 'nominal' },
            { index: 10, name: 'exon_end', type: 'nominal' }
        ]
    },
    dataTransform: [
        { type: 'filter', field: 'type', oneOf: ['gene'] },
        {
            type: 'displace',
            method: 'pile',
            boundingBox: { startField: 'start', endField: 'end' },
            newField: 'row',
            maxRows: 15
        }
    ],
    title: 'hg38 | Transcript (Max. 15 Rows)',
    tracks: [
        {
            dataTransform: [
                {
                    type: 'displace',
                    method: 'pile',
                    boundingBox: { startField: 'start', endField: 'end' },
                    newField: 'row',
                    maxRows: 15
                },
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'triangleRight',
            encoding: {
                x: {
                    field: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                size: { value: 15 }
            }
        },
        {
            dataTransform: [
                {
                    type: 'displace',
                    method: 'pile',
                    boundingBox: { startField: 'start', endField: 'end' },
                    newField: 'row',
                    maxRows: 15
                },
                { type: 'filter', field: 'type', oneOf: ['gene'] }
            ],
            mark: 'text',
            encoding: {
                text: { field: 'name', type: 'nominal' },
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic'
                }
            },
            style: {
                dy: -10
            }
        },
        {
            dataTransform: [
                {
                    type: 'displace',
                    method: 'pile',
                    boundingBox: { startField: 'start', endField: 'end' },
                    newField: 'row',
                    maxRows: 15
                },
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'triangleLeft',
            encoding: {
                x: {
                    field: 'start',
                    type: 'genomic'
                },
                size: { value: 15 }
            },
            style: { align: 'right' }
        },
        {
            dataTransform: [
                {
                    type: 'displace',
                    method: 'pile',
                    boundingBox: { startField: 'start', endField: 'end' },
                    newField: 'row',
                    maxRows: 15
                },
                {
                    type: 'exonSplit',
                    separator: ',',
                    flag: { field: 'type', value: 'exon' },
                    fields: [
                        { field: 'exon_start', type: 'genomic', newField: 'start', chrField: 'chr' },
                        { field: 'exon_end', type: 'genomic', newField: 'end', chrField: 'chr' }
                    ]
                },
                { type: 'filter', field: 'type', oneOf: ['exon'] }
            ],
            mark: 'rect',
            encoding: {
                size: { value: 10 },
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic'
                }
            }
        },
        {
            dataTransform: [
                {
                    type: 'displace',
                    method: 'pile',
                    boundingBox: { startField: 'start', endField: 'end' },
                    newField: 'row',
                    maxRows: 15
                },
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'rule',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic'
                },
                strokeWidth: { value: 3 }
            },
            style: {
                linePattern: { type: 'triangleRight', size: 5 }
            }
        },
        {
            dataTransform: [
                {
                    type: 'displace',
                    method: 'pile',
                    boundingBox: { startField: 'start', endField: 'end' },
                    newField: 'row',
                    maxRows: 15
                },
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'rule',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic'
                },
                strokeWidth: { value: 3 }
            },
            style: {
                linePattern: { type: 'triangleRight', size: 5 }
            }
        }
    ],
    encoding: {
        row: { field: 'row', type: 'nominal' },
        color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#0072B2', '#D45E00'] },
        opacity: { value: 0.8 }
    },
    visibility: [
        {
            operation: 'less-than',
            measure: 'width',
            threshold: '|xe-x|',
            transitionPadding: 10,
            target: 'mark'
        }
    ],
    style: { outline: 'black' },
    width: 700,
    height: 500
};
