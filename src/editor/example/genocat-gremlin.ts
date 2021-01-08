import { GeminidSpec } from '../../core/geminid.schema';

export const GENOCAT_GREMLIN: GeminidSpec = {
    title: 'Gremlin',
    subtitle: 'Reimplementation of GenoCAT examples',
    arrangement: {
        columnSizes: 800,
        rowSizes: [80, 80, 60, 200, 200],
        rowGaps: [0, 20, 40, 40]
    },
    tracks: [
        {
            title: 'Chromosome 5', //Complete Genome',
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
            dataTransform: {
                filter: [
                    { field: 'chr', oneOf: ['hs5'], not: false },
                    { field: 'chr_2', oneOf: ['hs5'], not: false }
                ]
            },
            superpose: [
                {},
                {
                    mark: 'rect-brush',
                    x: { linkingID: 'view2' },
                    strokeWidth: { value: 0 }
                }
            ],
            mark: 'link',
            x: { field: 'p1', type: 'genomic', linkingID: 'view1' },
            xe: { field: 'p1_2', type: 'genomic' },
            x1: { field: 'p2', type: 'genomic' },
            x1e: { field: 'P2_2', type: 'genomic' },
            stroke: { value: '#62AAD7' },
            strokeWidth: { value: 1 },
            opacity: { value: 0.4 },
            style: { outline: 'white' }
            // style: { circularLink: true },
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
                sampleLength: 2000
            },
            dataTransform: {
                filter: [
                    { field: 'chr', oneOf: ['hs5', 'hs4', 'hs6'], not: false },
                    { field: 'chr_2', oneOf: ['hs5', 'hs4', 'hs6'], not: false }
                ]
            },
            superpose: [
                {},
                {
                    mark: 'rect-brush',
                    x: { linkingID: 'view2' },
                    strokeWidth: { value: 0 }
                }
            ],
            mark: 'rect',
            x: { field: 'p1', type: 'genomic', linkingID: 'view1', axis: 'bottom' },
            xe: { field: 'p2', type: 'genomic' },
            row: { field: 'chr_2', type: 'nominal', domain: ['hs5', 'hs4', 'hs6'] },
            color: {
                field: 'chr_2',
                type: 'nominal',
                domain: ['hs5', 'hs4', 'hs6'],
                range: ['#62AAD7', '#D1A74F', '#6CB74C']
            },
            stroke: {
                field: 'chr_2',
                type: 'nominal',
                domain: ['hs5', 'hs4', 'hs6'],
                range: ['#62AAD7', '#D1A74F', '#6CB74C']
            },
            strokeWidth: { value: 2 },
            opacity: { value: 0.4 },
            style: { outline: 'black', outlineWidth: 1 }
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
                    },
                    color: {
                        field: 'Stain',
                        type: 'nominal',
                        domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                        range: ['#C0C0C0', '#808080', '#404040', 'black', 'black', 'black']
                    },
                    size: { value: 20 }
                },
                {
                    mark: 'rect',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['acen'], not: false }]
                    },
                    size: { value: 10 },
                    color: { value: '#B74780' }
                },
                {
                    mark: 'text',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['gpos25', 'gpos50', 'gpos100'], not: false }]
                    },
                    text: { field: 'Name', type: 'nominal' },
                    visibility: {
                        operation: 'less-than',
                        condition: { width: '|xe-x|', transitionPadding: 10 },
                        target: 'mark'
                    },
                    style: {
                        dy: 16,
                        textFontSize: 6,
                        textStrokeWidth: 0,
                        outline: 'white'
                    }
                },
                {
                    mark: 'text',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['gneg', 'gpos75', 'gvar'], not: false }]
                    },
                    text: { field: 'Name', type: 'nominal' },
                    visibility: {
                        operation: 'less-than',
                        condition: { width: '|xe-x|', transitionPadding: 10 },
                        target: 'mark'
                    },
                    style: {
                        dy: -16,
                        textFontSize: 6,
                        textStrokeWidth: 0,
                        outline: 'white'
                    }
                },
                {
                    mark: 'rect-brush',
                    x: { linkingID: 'view2' },
                    strokeWidth: { value: 0 }
                }
            ],
            x: {
                field: 'chromStart',
                type: 'genomic',
                domain: { chromosome: '5', interval: [0, 80000000] },
                linkingID: 'view1'
            },
            xe: { field: 'chromEnd', type: 'genomic' },
            color: { value: 'black' },
            stroke: { value: 'white' },
            strokeWidth: { value: 1 },
            style: { outline: 'white' }
        },
        {
            title: 'Region of Interest',
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
            dataTransform: {
                filter: [
                    { field: 'chr', oneOf: ['hs5', 'hs4', 'hs6'], not: false },
                    { field: 'chr_2', oneOf: ['hs5', 'hs4', 'hs6'], not: false }
                ]
            },
            mark: 'link',
            x: {
                field: 'p1',
                type: 'genomic',
                linkingID: 'view2',
                axis: 'bottom',
                domain: { chromosome: '5', interval: [68000000, 71000000] }
            },
            xe: { field: 'p2', type: 'genomic' },
            row: { field: 'chr_2', type: 'nominal', domain: ['hs5', 'hs4', 'hs6', 'empty'] },
            color: { value: 'none' },
            stroke: {
                field: 'chr_2',
                type: 'nominal',
                domain: ['hs5', 'hs4', 'hs6'],
                range: ['#62AAD7', '#D1A74F', '#6CB74C']
            },
            strokeWidth: { value: 6 },
            opacity: { value: 0.4 },
            style: { outline: 'lightgray', outlineWidth: 3, circularLink: false, background: '#F8F8F8' }
        },
        {
            title: 'Rearrangement View',
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
            dataTransform: { filter: [{ field: 'chr', oneOf: ['hs5'], not: false }] },
            mark: 'link',
            x: {
                field: 'p1',
                type: 'genomic',
                axis: 'bottom',
                domain: { chromosome: '5', interval: [69276000, 69282000] }
            },
            xe: { field: 'p2', type: 'genomic' },
            color: { value: 'none' },
            stroke: { value: '#62AAD7' },
            strokeWidth: { value: 6 },
            opacity: { value: 0.4 },
            style: { outline: 'lightgray', outlineWidth: 3, circularLink: false },
            width: 600
        }
    ]
};
