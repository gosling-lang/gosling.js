import { DataDeep, GoslingSpec, Track } from '../../core/gosling.schema';

const width = 350;
const height = 100;
const data = {
    url: 'https://resgen.io/api/v1/tileset_info/?d=M9A9klpwTci5Vf4bHZ864g',
    type: 'bed',
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
} as DataDeep;
const domain = undefined; // { chromosome: '3', interval: [52168000, 52890000] };

const HiGlass: Track = {
    title: 'HiGlass',
    data,
    overlay: [
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
            },
            mark: 'triangle-r',
            x: {
                field: 'end',
                type: 'genomic',
                domain,
                axis: 'top'
            },
            size: { value: 15 }
        },
        {
            dataTransform: {
                filter: [{ field: 'type', oneOf: ['gene'] }]
            },
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            x: {
                field: 'start',
                type: 'genomic'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            style: {
                dy: -15
            }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
            },
            mark: 'triangle-l',
            x: {
                field: 'start',
                type: 'genomic'
            },
            size: { value: 15 },
            style: { align: 'right' }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic'
            },
            size: { value: 15 },
            xe: {
                field: 'end',
                type: 'genomic'
            }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
            },
            mark: 'rule',
            x: {
                field: 'start',
                type: 'genomic'
            },
            strokeWidth: { value: 3 },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            style: {
                linePattern: { type: 'triangle-r', size: 5 }
            }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
            },
            mark: 'rule',
            x: {
                field: 'start',
                type: 'genomic'
            },
            strokeWidth: { value: 3 },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            style: {
                linePattern: { type: 'triangle-l', size: 5 }
            }
        }
    ],
    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
    color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#7585FF', '#FF8A85'] },
    visibility: [
        {
            operation: 'less-than',
            measure: 'width',
            threshold: '|xe-x|',
            transitionPadding: 10,
            target: 'mark'
        }
    ],
    opacity: { value: 0.8 },
    width,
    height
};

const IGV: Track = {
    title: 'IGV',
    data,
    overlay: [
        {
            dataTransform: {
                filter: [{ field: 'type', oneOf: ['gene'] }]
            },
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            x: {
                field: 'start',
                type: 'genomic',
                domain,
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['gene'] }] },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            size: { value: 15 },
            xe: {
                field: 'end',
                type: 'genomic'
            }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
            },
            mark: 'rule',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            strokeWidth: { value: 0 },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: 'white' },
            opacity: { value: 0.6 },
            style: {
                linePattern: { type: 'triangle-l', size: 10 }
            }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
            },
            mark: 'rule',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            strokeWidth: { value: 0 },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: 'white' },
            opacity: { value: 0.6 },
            style: {
                linePattern: { type: 'triangle-r', size: 10 }
            }
        }
    ],
    // y: { field: 'strand', type: 'nominal' },
    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
    color: { value: '#0900B1' },
    visibility: [
        {
            operation: 'less-than',
            measure: 'width',
            threshold: '|xe-x|',
            transitionPadding: 10,
            target: 'mark'
        }
    ],
    width,
    height
};

const CyverseQUBES: Track = {
    title: 'Cyverse-QUBES',
    data,
    overlay: [
        {
            dataTransform: {
                filter: [{ field: 'type', oneOf: ['gene'] }]
            },
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            x: {
                field: 'start',
                type: 'genomic',
                domain,
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: 'black' }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
            },
            mark: 'triangle-r',
            x: {
                field: 'end',
                type: 'genomic',
                axis: 'top'
            },
            color: { value: '#999999' }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
            },
            mark: 'triangle-l',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            color: { value: '#999999' },
            style: {
                align: 'right'
            }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['gene'] }] },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: 'lightgray' }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['gene'] }] },
            mark: 'rule',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            strokeWidth: { value: 5 },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: 'gray' }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: '#E2A6F5' },
            stroke: { value: '#BB57C9' },
            strokeWidth: { value: 1 }
        }
    ],
    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
    visibility: [
        {
            operation: 'less-than',
            measure: 'width',
            threshold: '|xe-x|',
            transitionPadding: 10,
            target: 'mark'
        }
    ],
    size: { value: 15 },
    width,
    height
};

const GmGDB: Track = {
    title: 'GmGDV',
    data,
    overlay: [
        {
            dataTransform: {
                filter: [{ field: 'type', oneOf: ['gene'] }]
            },
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            x: {
                field: 'start',
                type: 'genomic',
                domain,
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            style: {
                dy: -14
            }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
            },
            mark: 'triangle-r',
            x: {
                field: 'end',
                type: 'genomic',
                axis: 'top'
            },
            size: { value: 15 }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
            },
            mark: 'triangle-l',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            size: { value: 15 },
            style: {
                align: 'right'
            }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            size: { value: 10 },
            xe: {
                field: 'end',
                type: 'genomic'
            }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['gene'] }] },
            mark: 'rule',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            strokeWidth: { value: 3 },
            xe: {
                field: 'end',
                type: 'genomic'
            }
        }
        // {
        //  // TODO: Gosling Datafetcher to support multiple data types
        //     data: [
        //         { position: 3700000, strand: '+' }
        //     ]
        // }
    ],
    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
    color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] },
    visibility: [
        {
            operation: 'less-than',
            measure: 'width',
            threshold: '|xe-x|',
            transitionPadding: 10,
            target: 'mark'
        }
    ],
    width,
    height
};

const g6: Track = {
    data,
    overlay: [
        {
            dataTransform: {
                filter: [{ field: 'type', oneOf: ['gene'] }]
            },
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            x: {
                field: 'start',
                type: 'genomic',
                domain,
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            style: {
                dy: -14
            }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            size: { value: 10 },
            xe: {
                field: 'end',
                type: 'genomic'
            }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['intron'] }] },
            mark: 'rule',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            strokeWidth: { value: 2 },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            style: {
                curve: 'top'
            }
        }
    ],
    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
    color: { value: '#B54F4A' },
    visibility: [
        {
            operation: 'less-than',
            measure: 'width',
            threshold: '|xe-x|',
            transitionPadding: 10,
            target: 'mark'
        }
    ],
    width,
    height
};
const g7: Track = {
    data,
    overlay: [
        {
            dataTransform: {
                filter: [{ field: 'type', oneOf: ['gene'] }]
            },
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            x: {
                field: 'start',
                type: 'genomic',
                domain,
                axis: 'top'
            },
            color: { value: 'black' },
            xe: {
                field: 'end',
                type: 'genomic'
            }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['gene'] }] },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: '#666666' }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: '#FF6666' }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['intron'] }] },
            mark: 'rect',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: '#99FEFF' }
        }
    ],
    size: { value: 30 },
    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
    stroke: { value: '#777777' },
    strokeWidth: { value: 1 },
    visibility: [
        {
            operation: 'less-than',
            measure: 'width',
            threshold: '|xe-x|',
            transitionPadding: 10,
            target: 'mark'
        }
    ],
    width,
    height
};

const GIVE: Track = {
    title: 'GIVE',
    data,
    overlay: [
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
            },
            mark: 'rect',
            x: {
                field: 'end',
                type: 'genomic',
                axis: 'top'
            },
            size: { value: 7 }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
            },
            mark: 'rect',
            x: { field: 'start', type: 'genomic' },
            size: { value: 7 }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
            mark: 'rect',
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            size: { value: 14 }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['gene'] }] },
            mark: 'rule',
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            strokeWidth: { value: 3 }
        }
    ],
    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
    color: { value: '#4050B4' },
    width,
    height
};

const CorcesEtAl: Track = {
    title: 'Corces et al.',
    data,
    overlay: [
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
            },
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            x: {
                field: 'start',
                type: 'genomic',
                domain
            },
            xe: { field: 'end', type: 'genomic' },
            style: { textFontSize: 8, dy: -12 }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
            },
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            style: { textFontSize: 8, dy: 10 }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['+'] }
                ]
            },
            mark: 'rect',
            x: { field: 'end', type: 'genomic' },
            size: { value: 7 }
        },
        {
            dataTransform: {
                filter: [
                    { field: 'type', oneOf: ['gene'] },
                    { field: 'strand', oneOf: ['-'] }
                ]
            },
            mark: 'rect',
            x: { field: 'start', type: 'genomic' },
            size: { value: 7 }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
            mark: 'rect',
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            size: { value: 14 }
        },
        {
            dataTransform: { filter: [{ field: 'type', oneOf: ['gene'] }] },
            mark: 'rule',
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            strokeWidth: { value: 3 }
        }
    ],
    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
    color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#012DB8', '#BE1E2C'] },
    visibility: [
        {
            operation: 'less-than',
            measure: 'width',
            threshold: '|xe-x|',
            transitionPadding: 10,
            target: 'mark'
        }
    ],
    width,
    height
};

export const EX_TRACK_GENE_ANNOTATION = {
    higlass: HiGlass,
    igv: IGV,
    cyverse: CyverseQUBES,
    gmgdb: GmGDB,
    give: GIVE,
    corces: CorcesEtAl,
    g6: g6,
    g7: g7
};

export const EX_SPEC_GENE_ANNOTATION: GoslingSpec = {
    layout: 'linear',
    xDomain: { chromosome: '3', interval: [52168000, 52890000] },
    hconcatViews: [
        {
            vconcatViews: [
                { tracks: [EX_TRACK_GENE_ANNOTATION.higlass] },
                { tracks: [EX_TRACK_GENE_ANNOTATION.corces] },
                { tracks: [EX_TRACK_GENE_ANNOTATION.igv] }
            ]
        },
        {
            vconcatViews: [
                { tracks: [EX_TRACK_GENE_ANNOTATION.cyverse] },
                { tracks: [EX_TRACK_GENE_ANNOTATION.gmgdb] },
                { tracks: [EX_TRACK_GENE_ANNOTATION.g7] }
            ]
        }
    ]
};
