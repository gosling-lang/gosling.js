import { GeminidSpec } from '../../core/geminid.schema';

export const GENOCAT_MIZBEE: GeminidSpec = {
    layout: 'circular',
    static: true,
    arrangement: {
        columnSizes: 800,
        rowSizes: [100, 800]
    },
    tracks: [
        {
            title: 'Chromosome 1',
            layout: 'linear',
            data: {
                url: 'https://raw.githubusercontent.com/vigsterkr/circos/master/data/5/segdup.txt',
                type: 'csv',
                headerNames: ['id', 'chr', 'p1', 'p2'],
                chromosomePrefix: 'hs',
                chromosomeField: 'chr',
                genomicFields: ['p1', 'p2'],
                separator: ' ',
                longToWideId: 'id',
                sampleLength: 10000
            },
            dataTransform: {
                filter: [
                    { field: 'chr', oneOf: ['hs1'], not: false },
                    { field: 'chr_2', oneOf: ['hs3', 'hs10', 'hs12', 'hs16'], not: false }
                ]
            },
            mark: 'rect',
            superpose: [
                {
                    x: { field: 'p1', type: 'genomic', axis: 'top', domain: { chromosome: '1' } },
                    xe: { field: 'p2', type: 'genomic' }
                },
                {
                    x: { field: 'p1_2', type: 'genomic' },
                    xe: { field: 'p2_2', type: 'genomic' }
                }
            ],
            stroke: {
                field: 'chr_2',
                type: 'nominal',
                domain: ['hs3', 'hs10', 'hs12', 'hs16'],
                range: ['#EC9DA1', '#79A087', '#6587AC', '#C2AEBB']
            },
            strokeWidth: { value: 1.5 },
            opacity: { value: 0.4 },
            style: { outlineWidth: 1, outline: 'black' }
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
                longToWideId: 'id',
                sampleLength: 10000
            },
            dataTransform: {
                filter: [
                    { field: 'chr', oneOf: ['hs1'], not: false },
                    { field: 'chr_2', oneOf: ['hs3', 'hs10', 'hs12', 'hs16'], not: false }
                ]
            },
            mark: 'link',
            x: { field: 'p1', type: 'genomic' },
            xe: { field: 'p1_2', type: 'genomic' },
            x1: { field: 'p2', type: 'genomic' },
            x1e: { field: 'P2_2', type: 'genomic' },
            stroke: {
                field: 'chr_2',
                type: 'nominal',
                domain: ['hs3', 'hs10', 'hs12', 'hs16'],
                range: ['#EC9DA1', '#79A087', '#6587AC', '#C2AEBB']
            },
            strokeWidth: { value: 1.5 },
            opacity: { value: 0.4 },
            style: { circularLink: true, background: '#E1E2E3' },
            outerRadius: 250,
            innerRadius: 0
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
                field: 'Chromosome',
                type: 'nominal',
                range: ['#B2B4B6']
            },
            x: {
                field: 'chromStart',
                type: 'genomic',
                aggregate: 'min'
            },
            xe: {
                field: 'chromEnd',
                aggregate: 'max',
                type: 'genomic'
            },
            strokeWidth: { value: 1 },
            stroke: { value: '#E1E2E3' },
            outerRadius: 300,
            innerRadius: 250,
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
            dataTransform: { filter: [{ field: 'Chromosome', oneOf: ['chr1'], not: false }] },
            mark: 'rect',
            color: {
                field: 'Chromosome',
                type: 'nominal',
                range: ['white']
            },
            x: {
                field: 'chromStart',
                type: 'genomic',
                aggregate: 'min'
            },
            xe: {
                field: 'chromEnd',
                aggregate: 'max',
                type: 'genomic'
            },
            strokeWidth: { value: 0 },
            outerRadius: 300,
            innerRadius: 250,
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
                longToWideId: 'id',
                sampleLength: 10000
            },
            dataTransform: {
                filter: [
                    { field: 'chr', oneOf: ['hs1'], not: false },
                    { field: 'chr_2', oneOf: ['hs3', 'hs10', 'hs12', 'hs16'], not: false }
                ]
            },
            mark: 'rect',
            superpose: [
                {
                    x: { field: 'p1', type: 'genomic' },
                    xe: { field: 'p2', type: 'genomic' }
                },
                {
                    x: { field: 'p1_2', type: 'genomic' },
                    xe: { field: 'p2_2', type: 'genomic' }
                }
            ],
            stroke: {
                field: 'chr_2',
                type: 'nominal',
                domain: ['hs3', 'hs10', 'hs12', 'hs16'],
                range: ['#EC9DA1', '#79A087', '#6587AC', '#C2AEBB']
            },
            strokeWidth: { value: 1.5 },
            opacity: { value: 0.4 },
            style: { circularLink: true },
            outerRadius: 300,
            innerRadius: 250,
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
            dataTransform: { filter: [{ field: 'Chromosome', oneOf: ['chr1'], not: false }] },
            mark: 'rect',
            color: {
                field: 'Chromosome',
                type: 'nominal',
                range: ['none']
            },
            x: {
                field: 'chromStart',
                type: 'genomic',
                aggregate: 'min'
            },
            xe: {
                field: 'chromEnd',
                aggregate: 'max',
                type: 'genomic'
            },
            strokeWidth: { value: 2 },
            stroke: { value: 'black' },
            outerRadius: 300,
            innerRadius: 250,
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
                field: 'Chromosome',
                type: 'nominal',
                range: ['white']
            },
            x: {
                field: 'chromStart',
                type: 'genomic',
                aggregate: 'min'
            },
            xe: {
                field: 'chromEnd',
                aggregate: 'max',
                type: 'genomic'
            },
            strokeWidth: { value: 1 },
            stroke: { value: '#E1E2E3' },
            outerRadius: 380,
            innerRadius: 340,
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
                longToWideId: 'id',
                sampleLength: 1000
            },
            mark: 'rect',
            superpose: [
                {
                    x: { field: 'p1', type: 'genomic' },
                    xe: { field: 'p2', type: 'genomic' }
                },
                {
                    x: { field: 'p1_2', type: 'genomic' },
                    xe: { field: 'p2_2', type: 'genomic' }
                }
            ],
            stroke: {
                field: 'chr_2',
                type: 'nominal',
                domain: ['hs3', 'hs10', 'hs12', 'hs16'],
                range: ['#EC9DA1', '#79A087', '#6587AC', '#C2AEBB']
            },
            strokeWidth: { value: 1.5 },
            opacity: { value: 0.4 },
            outerRadius: 380,
            innerRadius: 340,
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
                field: 'Chromosome',
                type: 'nominal',
                range: ['none']
            },
            x: {
                field: 'chromStart',
                type: 'genomic',
                aggregate: 'min'
            },
            xe: {
                field: 'chromEnd',
                aggregate: 'max',
                type: 'genomic'
            },
            strokeWidth: { value: 3 },
            stroke: { value: '#CCCECF' },
            outerRadius: 380,
            innerRadius: 340,
            superposeOnPreviousTrack: true
        }
    ]
} as GeminidSpec;
