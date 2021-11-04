import type { DataDeep, GoslingSpec, OverlaidTracks } from '@gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

const width = 350;
const height = 100;
const data = {
    url: GOSLING_PUBLIC_DATA.geneAnnotation,
    type: 'beddb',
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

const HiGlass: OverlaidTracks = {
    alignment: 'overlay',
    title: 'HiGlass',
    data,
    tracks: [
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'triangleRight',
            encoding: {
                x: {
                    field: 'end',
                    type: 'genomic',
                    domain,
                    axis: 'top'
                },
                size: { value: 15 }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'text',
            encoding: {
                text: { field: 'name', type: 'nominal' },
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic'
                }
            },
            style: {
                dy: -15
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'triangleLeft',
            encoding: {
                x: {
                    field: 'start',
                    type: 'genomic'
                },
                size: { value: 15 }
            },
            style: { align: 'right' }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
            mark: 'rect',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic'
                },
                size: { value: 15 }
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'rule',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic'
                },
                strokeWidth: { value: 3 }
            },
            style: {
                linePattern: { type: 'triangleRight', size: 5 }
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'rule',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic'
                },
                strokeWidth: { value: 3 }
            },
            style: {
                linePattern: { type: 'triangleLeft', size: 5 }
            }
        }
    ],
    encoding: {
        row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
        color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#7585FF', '#FF8A85'] },
        opacity: { value: 0.8 }
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
    width,
    height
};

const IGV: OverlaidTracks = {
    alignment: 'overlay',
    title: 'IGV',
    data,
    tracks: [
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'text',
            encoding: {
                text: { field: 'name', type: 'nominal' },
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    domain,
                    axis: 'top'
                }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'rect',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                size: { value: 15 }
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'rule',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                strokeWidth: { value: 0 },
                color: { value: 'white' },
                opacity: { value: 0.6 }
            },
            style: {
                linePattern: { type: 'triangleLeft', size: 10 }
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'rule',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                strokeWidth: { value: 0 },
                color: { value: 'white' },
                opacity: { value: 0.6 }
            },
            style: {
                linePattern: { type: 'triangleRight', size: 10 }
            }
        }
    ],
    // y: { field: 'strand', type: 'nominal' },
    encoding: {
        row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
        color: { value: '#0900B1' }
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
    width,
    height
};

const CyverseQUBES: OverlaidTracks = {
    alignment: 'overlay',
    title: 'Cyverse-QUBES',
    data,
    tracks: [
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'text',
            encoding: {
                text: { field: 'name', type: 'nominal' },
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    domain
                },
                color: { value: 'black' }
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'triangleRight',
            encoding: {
                x: {
                    field: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                color: { value: '#999999' }
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'triangleLeft',
            encoding: {
                x: {
                    field: 'start',
                    type: 'genomic',
                    axis: 'top'
                },
                color: { value: '#999999' }
            },
            style: {
                align: 'right'
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'rect',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                color: { value: 'lightgray' }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'rule',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                strokeWidth: { value: 5 },
                color: { value: 'gray' }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
            mark: 'rect',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                color: { value: '#E2A6F5' },
                stroke: { value: '#BB57C9' },
                strokeWidth: { value: 1 }
            }
        }
    ],
    encoding: {
        row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
        size: { value: 15 }
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
    width,
    height
};

const GmGDB: OverlaidTracks = {
    alignment: 'overlay',
    title: 'GmGDV',
    data,
    tracks: [
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'text',
            encoding: {
                text: { field: 'name', type: 'nominal' },
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    domain,
                    axis: 'top'
                }
            },
            style: {
                dy: -14
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'triangleRight',
            encoding: {
                x: {
                    field: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                size: { value: 15 }
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'triangleLeft',
            encoding: {
                x: {
                    field: 'start',
                    type: 'genomic',
                    axis: 'top'
                },
                size: { value: 15 }
            },
            style: {
                align: 'right'
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
            mark: 'rect',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                size: { value: 10 }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'rule',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                strokeWidth: { value: 3 }
            }
        }
        // {
        //  // TODO: Gosling Datafetcher to support multiple data types
        //     data: [
        //         { position: 3700000, strand: '+' }
        //     ]
        // }
    ],
    encoding: {
        row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
        color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] }
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
    width,
    height
};

const g6: OverlaidTracks = {
    alignment: 'overlay',
    data,
    tracks: [
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'text',
            encoding: {
                text: { field: 'name', type: 'nominal' },
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    domain,
                    axis: 'top'
                }
            },
            style: {
                dy: -14
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
            mark: 'rect',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                size: { value: 10 }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['intron'] }],
            mark: 'rule',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                strokeWidth: { value: 2 }
            },
            style: {
                curve: 'top'
            }
        }
    ],
    encoding: {
        row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
        color: { value: '#B54F4A' }
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
    width,
    height
};
const g7: OverlaidTracks = {
    alignment: 'overlay',
    data,
    tracks: [
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'text',
            encoding: {
                text: { field: 'name', type: 'nominal' },
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    domain,
                    axis: 'top'
                },
                color: { value: 'black' }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'rect',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                color: { value: '#666666' }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
            mark: 'rect',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                color: { value: '#FF6666' }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['intron'] }],
            mark: 'rect',
            encoding: {
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                color: { value: '#99FEFF' }
            }
        }
    ],
    encoding: {
        size: { value: 30 },
        row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
        stroke: { value: '#777777' },
        strokeWidth: { value: 1 }
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
    width,
    height
};

const GIVE: OverlaidTracks = {
    alignment: 'overlay',
    title: 'GIVE',
    data,
    tracks: [
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'rect',
            encoding: {
                x: {
                    field: 'end',
                    type: 'genomic',
                    axis: 'top'
                },
                size: { value: 7 }
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'rect',
            encoding: {
                x: { field: 'start', type: 'genomic' },
                size: { value: 7 }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
            mark: 'rect',
            encoding: {
                x: { startField: 'start', endField: 'end', type: 'genomic' },
                size: { value: 14 }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'rule',
            encoding: {
                x: { startField: 'start', endField: 'end', type: 'genomic' },
                strokeWidth: { value: 3 }
            }
        }
    ],
    encoding: {
        row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
        color: { value: '#4050B4' }
    },
    width,
    height
};

const CorcesEtAl: OverlaidTracks = {
    alignment: 'overlay',
    title: 'Corces et al.',
    data,
    tracks: [
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'text',
            encoding: {
                text: { field: 'name', type: 'nominal' },
                x: {
                    startField: 'start',
                    endField: 'end',
                    type: 'genomic',
                    domain
                },
                size: { value: 8 }
            },
            style: { textFontSize: 8, dy: -12 }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'text',
            encoding: {
                text: { field: 'name', type: 'nominal' },
                x: { startField: 'start', endField: 'end', type: 'genomic' },
                size: { value: 8 }
            },
            style: { textFontSize: 8, dy: 10 }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['+'] }
            ],
            mark: 'rect',
            encoding: {
                x: { field: 'end', type: 'genomic' },
                size: { value: 7 }
            }
        },
        {
            dataTransform: [
                { type: 'filter', field: 'type', oneOf: ['gene'] },
                { type: 'filter', field: 'strand', oneOf: ['-'] }
            ],
            mark: 'rect',
            encoding: {
                x: { field: 'start', type: 'genomic' },
                size: { value: 7 }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
            mark: 'rect',
            encoding: {
                x: { startField: 'start', endField: 'end', type: 'genomic' },
                size: { value: 14 }
            }
        },
        {
            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
            mark: 'rule',
            encoding: {
                x: { startField: 'start', endField: 'end', type: 'genomic' },
                strokeWidth: { value: 3 }
            }
        }
    ],
    encoding: {
        row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
        color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#012DB8', '#BE1E2C'] }
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
    arrangement: 'horizontal',
    views: [
        {
            arrangement: 'vertical',
            views: [EX_TRACK_GENE_ANNOTATION.higlass, EX_TRACK_GENE_ANNOTATION.corces, EX_TRACK_GENE_ANNOTATION.igv]
        },
        {
            arrangement: 'vertical',
            views: [EX_TRACK_GENE_ANNOTATION.cyverse, EX_TRACK_GENE_ANNOTATION.gmgdb, EX_TRACK_GENE_ANNOTATION.g7]
        }
    ]
};
