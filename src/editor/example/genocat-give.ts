import { GeminidSpec } from '../../core/geminid.schema';

export const GENOCAT_GIVE: GeminidSpec = {
    title: 'GIVE',
    subtitle: 'Reimplementation of GenoCAT examples',
    arrangement: {
        columnSizes: 1000,
        rowSizes: [80, 40, 40, 40, 40],
        rowGaps: [10, 10, 10, 40]
    },
    tracks: [
        {
            title: 'Genes',
            data: { type: 'tileset', url: 'https://resgen.io/api/v1/tileset_info/?d=M9A9klpwTci5Vf4bHZ864g' },
            metadata: {
                type: 'higlass-bed',
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
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['+'], not: false }
                        ]
                    },
                    mark: 'rect',
                    x: {
                        field: 'end',
                        type: 'genomic',
                        domain: { chromosome: '17', interval: [200000, 800000] },
                        axis: 'top',
                        linkingID: '_'
                    },
                    size: { value: 7 }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['-'], not: false }
                        ]
                    },
                    mark: 'rect',
                    x: { field: 'start', type: 'genomic' },
                    size: { value: 7 }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    size: { value: 14 }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
                    mark: 'rule',
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    strokeWidth: { value: 3 }
                }
            ],
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { value: '#4050B4' },
            style: { outline: 'white' }
        },
        {
            data: { type: 'tileset', url: 'https://resgen.io/api/v1/tileset_info/?d=Zz3CBDSqQ3ySrOSe2yj1eg' },
            metadata: {
                type: 'higlass-vector',
                column: 'position',
                value: 'peak'
            },
            mark: 'bar',
            x: { field: 'position', type: 'genomic', linkingID: '_' },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#8A96D5' },
            style: { outline: 'white' }
        },
        {
            data: { type: 'tileset', url: 'https://resgen.io/api/v1/tileset_info/?d=dc_SOjdCRgq_8PYf6W--7w' },
            metadata: {
                type: 'higlass-vector',
                column: 'position',
                value: 'peak'
            },
            mark: 'bar',
            x: { field: 'position', type: 'genomic', linkingID: '_' },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#8A96D5' },
            style: { outline: 'white' }
        },
        {
            data: { type: 'tileset', url: 'https://resgen.io/api/v1/tileset_info/?d=Nolbrk9kS3CE0jJL_7OW1g' },
            metadata: {
                type: 'higlass-vector',
                column: 'position',
                value: 'peak'
            },
            mark: 'bar',
            x: { field: 'position', type: 'genomic', linkingID: '_' },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#8A96D5' },
            style: { outline: 'white' }
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                type: 'csv',
                chromosomeField: 'Chromosome',
                genomicFields: ['chromStart', 'chromEnd']
            },
            superpose: [
                {
                    mark: 'rect',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['acen'], not: true }]
                    }
                },
                {
                    mark: 'triangle-r',
                    dataTransform: {
                        filter: [
                            { field: 'Stain', oneOf: ['acen'], not: false },
                            { field: 'Name', include: 'q', not: false }
                        ]
                    }
                },
                {
                    mark: 'triangle-l',
                    dataTransform: {
                        filter: [
                            { field: 'Stain', oneOf: ['acen'], not: false },
                            { field: 'Name', include: 'p', not: false }
                        ]
                    }
                }
            ],
            x: {
                field: 'chromStart',
                type: 'genomic',
                domain: { chromosome: '17', interval: [20000000, 50000000] },
                linkingID: '_'
            },
            xe: { field: 'chromEnd', type: 'genomic' },
            color: { value: 'white' },
            size: { value: 14 },
            stroke: { value: 'gray' },
            strokeWidth: { value: 0.5 },
            style: {
                outline: 'white'
            }
        }
    ]
};
