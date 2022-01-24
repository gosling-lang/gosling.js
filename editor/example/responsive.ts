import { GoslingSpec } from '@gosling.schema';

export const EX_SPEC_RESPONSIVE_SEGREGATED_AREA_CHART: GoslingSpec = {
    // title: 'Responsive Visualization',
    // subtitle: 'Resize your browser to see visualization changes...',
    responsiveSize: { width: false, height: true },
    xDomain: { chromosome: '12', interval: [5000000, 15000000] },
    views: [
        {
            tracks: [
                {
                    alignment: 'overlay',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=cistrome-multivec',
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: [
                            'sample 1',
                            'sample 2',
                            'sample 3',
                            'sample -',
                            'sample -',
                            'sample 6',
                            'sample 7',
                            'sample 8',
                            'sample 9',
                            'sample 10',
                            'sample 11',
                            'sample 12',
                            'sample 13',
                            'sample 14',
                            'sample 15',
                            'sample 16'
                        ],
                        binSize: 4
                    },
                    dataTransform: [{ type: 'filter', field: 'sample', oneOf: ['sample -'], not: true }],
                    mark: 'area',
                    x: { field: 'position', type: 'genomic' },
                    color: { field: 'sample', type: 'nominal' },
                    tracks: [
                        {
                            y: { field: 'peak', type: 'quantitative', axis: 'right', domain: [0, 0.02], grid: true },
                            row: { field: 'sample', type: 'nominal', legend: true },
                            visibility: [
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'GT',
                                    threshold: 8 * 10
                                }
                            ]
                        },
                        {
                            mark: 'line',
                            y: { field: 'peak', type: 'quantitative', axis: 'right' },
                            visibility: [
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'LT',
                                    threshold: 8 * 10
                                }
                            ]
                        }
                    ],
                    width: 600,
                    height: 130
                }
            ]
        }
    ]
};

const TotalChartSizes = [400, 100]; // [192, 96, 48]; // from the paper below
export const EX_SPEC_RESPONSIVE_MULTIVEC: GoslingSpec = {
    description: 'Reference: Javed et al. Graphical perception of Multiple Time Series. TVCG 2010.',
    responsiveSize: { width: false, height: true },
    xDomain: { chromosome: '12', interval: [5000000, 15000000] },
    views: [
        {
            tracks: [
                {
                    alignment: 'overlay',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=cistrome-multivec',
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: [
                            'sample 1',
                            'sample 2',
                            'sample 3',
                            'sample -',
                            'sample -',
                            'sample 6',
                            'sample 7',
                            'sample 8',
                            'sample 9',
                            'sample 10',
                            'sample 11',
                            'sample 12',
                            'sample 13',
                            'sample 14',
                            'sample 15',
                            'sample 16'
                        ],
                        binSize: 4
                    },
                    dataTransform: [{ type: 'filter', field: 'sample', oneOf: ['sample -'], not: true }],
                    mark: 'area',
                    x: { field: 'position', type: 'genomic' },
                    color: { value: '#2270B5' },
                    tracks: [
                        {
                            // Sufficient Height
                            y: { field: 'peak', type: 'quantitative', axis: 'right', domain: [0, 0.01], grid: true },
                            row: { field: 'sample', type: 'nominal', legend: true },
                            opacity: { value: 0.6 },
                            visibility: [
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'GTET',
                                    threshold: TotalChartSizes[0]
                                }
                            ]
                        },
                        {
                            y: { field: 'peak', type: 'quantitative', axis: 'right', domain: [0, 0.0025] },
                            row: { field: 'sample', type: 'nominal', legend: true },
                            opacity: { value: 0.3 },
                            visibility: [
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'LT',
                                    threshold: TotalChartSizes[0]
                                },
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'GT',
                                    threshold: TotalChartSizes[1]
                                }
                            ]
                        },
                        {
                            y: { field: 'peak', type: 'quantitative', axis: 'none', domain: [0.0025, 0.005] },
                            row: { field: 'sample', type: 'nominal', legend: true },
                            opacity: { value: 0.3 },
                            visibility: [
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'LT',
                                    threshold: TotalChartSizes[0]
                                },
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'GT',
                                    threshold: TotalChartSizes[1]
                                }
                            ]
                        },
                        {
                            y: { field: 'peak', type: 'quantitative', axis: 'none', domain: [0.005, 0.0075] },
                            row: { field: 'sample', type: 'nominal', legend: true },
                            opacity: { value: 0.3 },
                            visibility: [
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'LT',
                                    threshold: TotalChartSizes[0]
                                },
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'GT',
                                    threshold: TotalChartSizes[1]
                                }
                            ]
                        },
                        {
                            y: { field: 'peak', type: 'quantitative', axis: 'none', domain: [0.0075, 0.01] },
                            row: { field: 'sample', type: 'nominal', legend: true },
                            opacity: { value: 0.3 },
                            visibility: [
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'LT',
                                    threshold: TotalChartSizes[0]
                                },
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'GT',
                                    threshold: TotalChartSizes[1]
                                }
                            ]
                        },
                        {
                            y: { field: 'peak', type: 'quantitative', axis: 'right' },
                            color: { field: 'sample', type: 'nominal', range: ['#2270B5'] },
                            opacity: { value: 0.5 },
                            stroke: { value: 'white' },
                            strokeWidth: { value: 1 },
                            visibility: [
                                {
                                    target: 'track',
                                    measure: 'height',
                                    operation: 'LTET',
                                    threshold: TotalChartSizes[1]
                                }
                            ]
                        }
                    ],
                    width: 600,
                    height: 130
                }
            ]
        }
    ]
};

// TODO: Add genes and allow rotation
export const EX_SPEC_RESPONSIVE_IDEOGRAM: GoslingSpec = {
    responsiveSize: { width: true, height: true },
    xDomain: { chromosome: '12' },
    views: [
        {
            tracks: [
                {
                    alignment: 'overlay',
                    data: {
                        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                        type: 'csv',
                        chromosomeField: 'Chromosome',
                        genomicFields: ['chromStart', 'chromEnd']
                    },
                    tracks: [
                        {
                            mark: 'text',
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen'], not: true }],
                            text: { field: 'Name', type: 'nominal' },
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                                range: ['black', 'black', 'black', 'black', 'white', 'black']
                            },
                            size: { value: 12 },
                            visibility: [
                                {
                                    target: 'mark',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    operation: 'LT'
                                },
                                {
                                    target: 'track',
                                    measure: 'height',
                                    threshold: 60,
                                    operation: 'LT'
                                }
                            ]
                        },
                        {
                            mark: 'text',
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen'], not: true }],
                            text: { field: 'Name', type: 'nominal' },
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                                range: ['black', 'black', 'black', 'black', 'black', 'black']
                            },
                            size: { value: 12 },
                            style: { dy: -20 },
                            visibility: [
                                {
                                    target: 'mark',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    operation: 'LT'
                                },
                                {
                                    target: 'track',
                                    measure: 'height',
                                    threshold: 60,
                                    operation: 'GTET'
                                }
                            ]
                        },
                        {
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen'], not: true }],
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                                range: ['white', '#D9D9D9', '#979797', '#636363', 'black', '#A0A0F2']
                            }
                        },
                        {
                            mark: 'triangleRight',
                            dataTransform: [
                                { type: 'filter', field: 'Stain', oneOf: ['acen'] },
                                { type: 'filter', field: 'Name', include: 'q' }
                            ],
                            color: { value: '#B40101' }
                        },
                        {
                            mark: 'triangleLeft',
                            dataTransform: [
                                { type: 'filter', field: 'Stain', oneOf: ['acen'] },
                                { type: 'filter', field: 'Name', include: 'p' }
                            ],
                            color: { value: '#B40101' }
                        }
                    ],
                    x: { field: 'chromStart', type: 'genomic' },
                    xe: { field: 'chromEnd', type: 'genomic' },
                    size: { value: 20 },
                    stroke: { value: 'gray' },
                    strokeWidth: { value: 0.5 },
                    width: 400,
                    height: 25
                }
            ]
        }
    ]
};
