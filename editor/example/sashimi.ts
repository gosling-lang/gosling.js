import { GoslingSpec } from 'gosling.js';

export const EX_SPEC_SASHIMI: GoslingSpec = {
    title: 'Sashimi Plot',
    subtitle: 'Sashimi plot based on a juction annotation file',
    description: 'https://regtools.readthedocs.io/en/latest/commands/junctions-annotate/',
    style: { outlineWidth: 0 },
    spacing: 0,
    static: true,
    views: [
        {
            xDomain: { interval: [1707408143 + (27040527 - 27035000), 1707408143 + (27040527 - 27035000) + 7549] },
            tracks: [
                {
                    data: {
                        type: 'bam',
                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/sashimi/ENCFF088HTJ.chr10_27035000_27050000.bam',
                        indexUrl:
                            'https://s3.amazonaws.com/gosling-lang.org/data/sashimi/ENCFF088HTJ.chr10_27035000_27050000.bam.bai',
                        extractJunction: true,
                        junctionMinCoverage: 100
                    },
                    alignment: 'overlay',
                    tracks: [
                        { mark: 'withinLink' },
                        {
                            mark: 'text',
                            text: { field: 'score', type: 'nominal' },
                            color: { value: 'black' },
                            stroke: { value: 'white' },
                            strokeWidth: { value: 3 },
                            visibility: [
                                {
                                    target: 'mark',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    operation: 'LT'
                                }
                            ]
                        }
                    ],
                    x: { field: 'start', type: 'genomic', axis: 'none' },
                    xe: { field: 'end', type: 'genomic' },
                    y: { field: 'score', type: 'quantitative' },
                    stroke: { value: '#FFC153' },
                    strokeWidth: { field: 'score', type: 'quantitative', range: [1, 4] },
                    opacity: { value: 0.8 },
                    style: { flatWithinLink: true },
                    width: 800,
                    height: 80
                },

                {
                    data: {
                        type: 'bam',
                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/sashimi/ENCFF088HTJ.chr10_27035000_27050000.bam',
                        indexUrl:
                            'https://s3.amazonaws.com/gosling-lang.org/data/sashimi/ENCFF088HTJ.chr10_27035000_27050000.bam.bai'
                    },
                    dataTransform: [
                        {
                            type: 'coverage',
                            startField: 'from',
                            endField: 'to'
                        }
                    ],
                    mark: 'bar',
                    x: { field: 'from', type: 'genomic', axis: 'none' },
                    xe: { field: 'to', type: 'genomic' },
                    y: { field: 'coverage', type: 'quantitative' },
                    color: { value: '#FFC153' },
                    width: 800,
                    height: 80
                }
            ]
        },
        {
            // xDomain: { chromosome: '10', interval: [27035000, 27150000] },
            xDomain: { chromosome: '10', interval: [27040527, 27048076] },
            tracks: [
                {
                    data: {
                        type: 'csv',
                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/sashimi/ggsashimi-annotation.gtf',
                        headerNames: ['chrom', 'name', 'type', 'start', 'end'],
                        separator: '\t',
                        chromosomeField: 'chrom',
                        genomicFields: ['start', 'end']
                    },
                    alignment: 'overlay',
                    mark: 'rect',
                    tracks: [
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }]
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            size: { value: 6 }
                        }
                    ],
                    x: { field: 'start', type: 'genomic', axis: 'bottom' },
                    xe: { field: 'end', type: 'genomic' },
                    color: { value: 'gray' },
                    // color: { field: 'type', type: 'nominal', legend: true },
                    width: 800,
                    height: 30
                }
            ]
        },
        {
            // xDomain: { interval: [1707408143, 1707408143 + 15000] },
            xDomain: { interval: [1707408143 + (27040527 - 27035000), 1707408143 + (27040527 - 27035000) + 7549] },
            tracks: [
                {
                    data: {
                        type: 'bam',
                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/sashimi/ENCFF088HTJ.chr10_27035000_27050000.bam',
                        indexUrl:
                            'https://s3.amazonaws.com/gosling-lang.org/data/sashimi/ENCFF088HTJ.chr10_27035000_27050000.bam.bai'
                    },
                    dataTransform: [
                        {
                            type: 'displace',
                            method: 'pile',
                            boundingBox: { startField: 'from', endField: 'to', padding: 4, isPaddingBP: true },
                            newField: 'pileup-row'
                        }
                    ],
                    mark: 'bar',
                    x: { field: 'from', type: 'genomic', axis: 'none' },
                    xe: { field: 'to', type: 'genomic' },
                    row: { field: 'pileup-row', type: 'nominal', padding: 0.05 },
                    color: { value: 'grey' },
                    width: 800,
                    height: 400
                }
            ]
        }
    ]
};
