import { MarkGlyph } from '../../../gemini.schema';

export const GLYPH_GENE_ANNOTATAION: MarkGlyph = {
    type: 'groupMark',
    name: 'gene-annotation',
    requiredChannels: [
        // TODO: What about optional channels?
        'x', 'xe',
        'y', 'color', // + or - strand?
        'geneOrExon', // genes or exons?
        'exonId',
        'exonVersion' // filtering by
    ],
    elements: [
        {
            // Should render once
            description: 'horizontal line',
            select: [
                { channel: 'geneOrExon', oneOf: ['gene'] },
            ],
            mark: 'line',
            color: { value: 'black' },
            size: { value: 3 }
        },
        {
            description: 'exon',
            select: [
                { channel: 'geneOrExon', oneOf: ['exon'] },
                { channel: 'exonVersion', oneOf: ['2'] }
            ],
            mark: 'rect',
            size: { value: 25 }
        },
        {
            description: 'gene left',
            select: [
                { channel: 'geneOrExon', oneOf: ['gene'] },
            ],
            mark: {
                bind: 'y',
                domain: ['-', '+'],
                range: ['triangle-l', 'rule']
            },
            size: { value: 25 },
            xe: 'none'
        },
        {
            description: 'gene right',
            select: [
                { channel: 'geneOrExon', oneOf: ['gene'] },
            ],
            mark: {
                bind: 'y',
                domain: ['-', '+'],
                range: ['rule', 'triangle-r']
            },
            size: { value: 25 },
            x: { bind: 'xe' },
            xe: 'none'
        },
        {
            mark: 'text',
            select: [
                { channel: 'geneOrExon', 'oneOf': ['gene'] }
            ],
            opacity: { value: 1 },
            size: { value: 18 },
            style: {
                dy: -20
            }
        },
        {
            mark: 'text',
            select: [
                { channel: 'geneOrExon', oneOf: ['exon'] },
                { channel: 'exonVersion', oneOf: ['2'] }
            ],
            text: { bind: 'exonId' },
            opacity: { value: 1 },
            size: { value: 6 },
            style: {
                dy: 28
            }
        }
    ]
}