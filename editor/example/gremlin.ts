import type { GoslingSpec } from 'gosling.js';

export const EX_SPEC_GREMLIN: GoslingSpec = {
    title: "Gremlin (O'Brien et al. 2010)",
    views: [
        {
            linkingId: 'view1',
            xDomain: { chromosome: '5', interval: [0, 80000000] },
            tracks: [
                {
                    alignment: 'overlay',
                    title: 'Chromosome 5',
                    data: {
                        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                        type: 'csv',
                        chromosomeField: 'Chromosome',
                        genomicFields: ['chromStart', 'chromEnd']
                    },
                    tracks: [
                        {
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen'], not: true }],
                            encoding: {
                                color: {
                                    field: 'Stain',
                                    type: 'nominal',
                                    domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                                    range: ['#C0C0C0', '#808080', '#404040', 'black', 'black', 'black']
                                },
                                size: { value: 20 }
                            }
                        },
                        {
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen'] }],
                            encoding: {
                                size: { value: 10 },
                                color: { value: '#B74780' }
                            }
                        },
                        {
                            mark: 'text',
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['gpos25', 'gpos50', 'gpos100'] }],
                            encoding: {
                                text: { field: 'Name', type: 'nominal' },
                                size: { value: 6 }
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
                            style: {
                                dy: 16,
                                outline: 'white'
                            }
                        },
                        {
                            mark: 'text',
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['gneg', 'gpos75', 'gvar'] }],
                            encoding: {
                                text: { field: 'Name', type: 'nominal' },
                                size: { value: 6 }
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
                            style: {
                                dy: -16,
                                outline: 'white'
                            }
                        },
                        {
                            mark: 'brush',
                            encoding: {
                                x: { linkingId: 'view2' },
                                strokeWidth: { value: 0 }
                            }
                        }
                    ],
                    encoding: {
                        x: {
                            startField: 'chromStart',
                            endField: 'chromEnd',
                            type: 'genomic'
                        },
                        color: { value: 'black' },
                        stroke: { value: 'white' },
                        strokeWidth: { value: 1 }
                    },
                    style: { outline: 'white' },
                    width: 800,
                    height: 60
                },
                {
                    alignment: 'overlay',
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
                    dataTransform: [
                        { type: 'filter', field: 'chr', oneOf: ['hs5', 'hs4', 'hs6'] },
                        { type: 'filter', field: 'chr_2', oneOf: ['hs5', 'hs4', 'hs6'] }
                    ],
                    tracks: [
                        { mark: 'rect' },
                        {
                            mark: 'brush',
                            encoding: {
                                x: { linkingId: 'view2' },
                                strokeWidth: { value: 0 }
                            }
                        }
                    ],
                    encoding: {
                        x: {
                            startField: 'p1',
                            endField: 'p2',
                            type: 'genomic'
                        },
                        row: {
                            field: 'chr_2',
                            type: 'nominal',
                            domain: ['hs5', 'hs4', 'hs6']
                        },
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
                        opacity: { value: 0.4 }
                    },
                    style: { outline: 'black', outlineWidth: 1 },
                    width: 800,
                    height: 80
                },
                {
                    alignment: 'overlay',
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
                    dataTransform: [
                        { type: 'filter', field: 'chr', oneOf: ['hs5'] },
                        { type: 'filter', field: 'chr_2', oneOf: ['hs5'] }
                    ],
                    tracks: [
                        { mark: 'withinLink' },
                        {
                            mark: 'brush',
                            encoding: {
                                x: { linkingId: 'view2' },
                                strokeWidth: { value: 0 }
                            }
                        }
                    ],
                    encoding: {
                        x: {
                            startField: 'p1',
                            endField: 'p1_2',
                            startField2: 'p2',
                            endField2: 'p2_2',
                            type: 'genomic',
                            linkingId: 'view1'
                        },
                        stroke: { value: '#6CB74C' },
                        strokeWidth: { value: 1 },
                        opacity: { value: 0.4 }
                    },
                    style: { outline: 'white' },
                    width: 800,
                    height: 220
                }
            ]
        },
        {
            views: [
                {
                    tracks: [
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
                            dataTransform: [
                                { type: 'filter', field: 'chr', oneOf: ['hs5', 'hs4', 'hs6'] },
                                { type: 'filter', field: 'chr_2', oneOf: ['hs5', 'hs4', 'hs6'] }
                            ],
                            mark: 'withinLink',
                            encoding: {
                                x: {
                                    startField: 'p1',
                                    endField: 'p2',
                                    type: 'genomic',
                                    linkingId: 'view2',
                                    axis: 'bottom',
                                    domain: { chromosome: '5', interval: [68000000, 71000000] }
                                },
                                row: {
                                    field: 'chr_2',
                                    type: 'nominal',
                                    domain: ['hs5', 'hs4', 'hs6', 'empty']
                                },
                                color: { value: 'none' },
                                stroke: {
                                    field: 'chr_2',
                                    type: 'nominal',
                                    domain: ['hs5', 'hs4', 'hs6'],
                                    range: ['#62AAD7', '#D1A74F', '#6CB74C']
                                },
                                strokeWidth: { value: 6 },
                                opacity: { value: 0.4 }
                            },
                            style: {
                                outline: 'lightgray',
                                outlineWidth: 3,
                                background: '#F8F8F8'
                            },
                            width: 800,
                            height: 200
                        }
                    ]
                },
                {
                    views: [
                        {
                            tracks: [
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
                                    dataTransform: [{ type: 'filter', field: 'chr', oneOf: ['hs5'] }],
                                    mark: 'withinLink',
                                    encoding: {
                                        x: {
                                            startField: 'p1',
                                            endField: 'p2',
                                            type: 'genomic',
                                            axis: 'bottom',
                                            domain: {
                                                chromosome: '5',
                                                interval: [69276000, 69282000]
                                            }
                                        },
                                        color: { value: 'none' },
                                        stroke: { value: '#62AAD7' },
                                        strokeWidth: { value: 6 },
                                        opacity: { value: 0.4 }
                                    },
                                    style: { outline: 'lightgray', outlineWidth: 3 },
                                    width: 600,
                                    height: 200
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
