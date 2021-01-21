import { GeminidSpec } from '../../core/geminid.schema';
import { EXAMPLE_DATASETS } from './basic/datasets';
import { EXAMPLE_CYTOAND_HG38 } from './cytoband-hg38';

export const GENOCAT_CIRCOS: GeminidSpec = {
    title: 'Circos',
    subtitle: 'Reimplementation of GenoCAT examples',
    description: 'http://circos.ca/intro/genomic_data/',
    layout: 'circular',
    static: true,
    arrangement: { columnSizes: 700, rowSizes: [60, 700] },
    tracks: [
        {
            // just for debuging
            ...EXAMPLE_CYTOAND_HG38.tracks[0],
            layout: 'linear'
        },
        {
            data: { type: 'tileset', url: 'https://resgen.io/api/v1/tileset_info/?d=VLFaiSVjTjW6mkbjRjWREA' },
            metadata: { type: 'higlass-vector', column: 'position', value: 'peak' },
            mark: 'bar',
            x: { field: 'position', type: 'genomic', axis: 'outer' },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#EEEDA1' },
            outerRadius: 340,
            innerRadius: 290
        },
        {
            data: { url: EXAMPLE_DATASETS.multivec, type: 'tileset' },
            metadata: {
                type: 'higlass-multivec',
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
            dataTransform: { filter: [{ field: 'peak', inRange: [0, 0.001], not: false }] },
            mark: 'rect',
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            stackY: true,
            color: { value: '#FF6205' },
            stroke: { value: 'white' },
            strokeWidth: { value: 1 },
            outerRadius: 287,
            innerRadius: 267,
            superposeOnPreviousTrack: true
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                type: 'csv',
                chromosomeField: 'Chromosome',
                genomicFields: ['chromStart', 'chromEnd']
            },

            mark: 'rect',
            color: {
                field: 'Stain',
                type: 'nominal',
                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar', 'acen'],
                range: ['white', '#D9D9D9', '#979797', '#636363', 'black', '#F0F0F0', '#8D8D8D']
            },
            x: { field: 'chromStart', type: 'genomic' },
            xe: { field: 'chromEnd', type: 'genomic' },
            stroke: { value: 'lightgray' },
            strokeWidth: { value: 0.5 },
            outerRadius: 264,
            innerRadius: 244,
            superposeOnPreviousTrack: true
        },
        {
            data: {
                url: 'https://raw.githubusercontent.com/vigsterkr/circos/master/data/5/segdup.txt',
                type: 'csv',
                headerNames: ['id', 'chr', 'p1', 'p2'],
                chromosomePrefix: 'hs',
                chromosomeField: 'chr',
                genomicFields: ['p1', 'p2'],
                separator: ' ',
                longToWideId: 'id'
                //sampleLength: 5000
            },
            dataTransform: { filter: [{ field: 'chr', oneOf: ['hs1'], not: true }] },
            mark: 'link',
            x: { field: 'p1', type: 'genomic' },
            xe: { field: 'p1_2', type: 'genomic' },
            x1: { field: 'p2', type: 'genomic' },
            x1e: { field: 'P2_2', type: 'genomic' },
            stroke: { value: 'lightgray' },
            strokeWidth: { value: 1 },
            opacity: { value: 0.4 },
            style: { circularLink: true },
            outerRadius: 241,
            innerRadius: 0,
            superposeOnPreviousTrack: true
        },
        {
            data: {
                url: 'https://raw.githubusercontent.com/vigsterkr/circos/master/data/5/segdup.txt',
                type: 'csv',
                headerNames: ['id', 'chr', 'p1', 'p2'],
                chromosomePrefix: 'hs',
                chromosomeField: 'chr',
                genomicFields: ['p1', 'p2'],
                separator: ' ',
                longToWideId: 'id'
                //sampleLength: 5000
            },
            dataTransform: { filter: [{ field: 'chr', oneOf: ['hs1'], not: false }] },
            mark: 'link',
            x: { field: 'p1', type: 'genomic' },
            xe: { field: 'p1_2', type: 'genomic' },
            x1: { field: 'p2', type: 'genomic' },
            x1e: { field: 'P2_2', type: 'genomic' },
            stroke: { field: 'chr_2', type: 'nominal' },
            strokeWidth: { value: 1.5 },
            opacity: { value: 0.4 },
            style: { circularLink: true },
            outerRadius: 241,
            innerRadius: 0,
            superposeOnPreviousTrack: true
        }
    ]
};
