import { GeminiSpec } from '../../gemini.schema';

export const GENE_ANNOTATION_PLOT_SIMPLE: GeminiSpec = {
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/Homo_sapiens.GRCh38.92.glyph.csv',
                type: 'csv'
            },
            mark: { server: 'gemini.v1', type: 'gene-annotation-simple' },
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            y: { field: 'strand', type: 'nominal' },
            text: { field: 'gene_name', type: 'nominal' },
            geneOrExon: { field: 'feature', type: 'nominal' },
            color: { value: '#D1D28D' },
            opacity: { value: 0.7 }
        }
    ]
};

export const GENE_ANNOTATION_PLOT: GeminiSpec = {
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/Homo_sapiens.GRCh38.92.glyph.csv',
                type: 'csv'
            },
            mark: { server: 'gemini.v1', type: 'gene-annotation' },
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            y: { field: 'strand', type: 'nominal' },
            text: { field: 'gene_name', type: 'nominal' },
            color: { field: 'strand', type: 'nominal' },
            exonVersion: { field: 'exon_version', type: 'nominal' },
            geneOrExon: { field: 'feature', type: 'nominal' },
            exonId: { field: 'exon_id', type: 'nominal' },
            opacity: { value: 0.9 }
        }
    ]
};

export const CYTOGENETIC_BAND: GeminiSpec = {
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/chr1_cytogenetic_band.glyph.csv',
                type: 'csv'
            },
            mark: { server: 'gemini.v1', type: 'cytogenetic-band' },
            x: { field: 'Basepair_start', type: 'genomic' },
            xe: { field: 'Basepair_stop', type: 'genomic' },
            y: { field: 'Chr.', type: 'nominal' },
            text: { field: 'Band', type: 'nominal' },
            stain: { field: 'Stain', type: 'nominal' },
            color: {
                field: 'Density',
                type: 'nominal',
                domain: ['', '25', '50', '75', '100'],
                range: ['white', '#D9D9D9', '#979797', '#636363', 'black']
            }
        }
    ]
};
