import { MarkGlyph } from '../../../gemini.schema'

export const GLYPH_GENE_ANNOTATAION_V2: MarkGlyph = {
    type: 'compositeMark',
    name: 'gene-annotation',
    requiredChannels: [
        'x', 'xe',
        'y', 'color', // + or - strand?
        'geneOrExon' // genes or exons?
    ],
    elements: [
        {
            description: 'gene range rect',
            select: [
                { channel: 'geneOrExon', oneOf: ['gene'] },
            ],
            mark: 'rect',
            size: { value: 25 }
        },
        {
            description: 'gene left',
            select: [
                { channel: 'geneOrExon', oneOf: ['gene'] },
                { channel: 'y', oneOf: ['-'] }
            ],
            mark: 'triangle-l',
            size: { value: 25 },
            xe: 'none'
        },
        {
            description: 'gene right',
            select: [
                { 'channel': 'geneOrExon', oneOf: ['gene'] },
                { 'channel': 'y', 'oneOf': ['+'] },
            ],
            mark: 'triangle-r',
            size: { value: 25 },
            'x': { 'bind': 'xe' },
            'xe': 'none'
        },
        {
            description: 'gene range line',
            select: [
                { channel: 'geneOrExon', oneOf: ['gene'] },
            ],
            mark: 'line',
            color: { value: 'gray' },
            size: { value: 2 },
            style: {
                dashed: '3, 3'
            }
        },
        {
            description: 'gene name',
            mark: 'text',
            select: [
                { channel: 'geneOrExon', oneOf: ['gene'] }
            ],
            color: { value: 'black' },
            opacity: { value: 1 },
            size: { value: 18 },
            style: {
                dy: -20
            }
        }
    ]
}