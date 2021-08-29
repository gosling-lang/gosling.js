import { GoslingSpec } from '../../core/gosling.schema';

export const EX_SPEC_ALIGNMENT: GoslingSpec = {
    title: 'Genome Alignment',
    subtitle: 'Reimplementation of Genome Alignment Example in Ideogram.js',
    arrangement: 'parallel',
    layout: 'circular',
    spacing: 0,
    style: { outlineWidth: 0 },
    // xDomain: { interval: [0, 500000000] },
    views: [
        {
            xLinkingId: 'top',
            assembly: 'mm10',
            tracks: [
                {
                    id: 'view-1',
                    template: 'ideogram',
                    data: {
                        url:
                            'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                        type: 'csv',
                        chromosomeField: 'Chromosome',
                        genomicFields: ['chromStart', 'chromEnd']
                    },
                    encoding: {
                        startPosition: { field: 'chromStart' },
                        endPosition: { field: 'chromEnd' },
                        stainBackgroundColor: {
                            field: 'Stain',
                            range: ['#E3E3E3', 'lightgray', 'gray', 'gray', 'black', '#7B9CC8', '#DC4542']
                        },
                        stainLabelColor: { field: 'Stain' },
                        name: { field: 'Name' },
                        stainStroke: { value: 'black' },
                        stainStrokeWidth: { value: 0 } // Let's not use strokes for a while
                    },
                    width: 1000,
                    height: 20
                }
            ]
        },
        {
            tracks: [
                {
                    id: 'view-2',
                    data: {
                        url:
                            'https://s3.amazonaws.com/gosling-lang.org/data/ideogram.js/homo_sapiens-mus_musculus-synteny-v73-adjusted.tsv',
                        type: 'csv',
                        genomicFieldsToConvert: [
                            {
                                assembly: 'mm10',
                                chromosomeField: 'Chromosome_spec1',
                                genomicFields: ['Start_spec1', 'End_spec1']
                            },
                            {
                                chromosomeField: 'Chromosome_spec2',
                                genomicFields: ['Start_spec2', 'End_spec2']
                            }
                        ],
                        separator: '\t'
                    },
                    mark: 'betweenLink',
                    x: {
                        field: 'Start_spec1',
                        type: 'genomic',
                        axis: 'none',
                        linkingId: 'top'
                    },
                    xe: { field: 'End_spec1', type: 'genomic' },
                    x1: {
                        field: 'Start_spec2',
                        type: 'genomic',
                        linkingId: 'bottom'
                    },
                    x1e: { field: 'End_spec2', type: 'genomic' },
                    strokeWidth: { value: 0 },
                    color: {
                        field: 'Chromosome_spec1',
                        type: 'nominal',
                        domain: [
                            'chr1',
                            'chr2',
                            'chr3',
                            'chr4',
                            'chr5',
                            'chr6',
                            'chr7',
                            'chr8',
                            'chr9',
                            'chr10',
                            'chr11',
                            'chr12',
                            'chr13',
                            'chr14',
                            'chr15',
                            'chr16',
                            'chr17',
                            'chr18',
                            'chr19',
                            'chr20',
                            'chr21',
                            'chr22',
                            'chrX',
                            'chrY'
                        ],
                        range: [
                            'rgb(153, 102, 0)',
                            'rgb(102, 102, 0)',
                            'rgb(153, 153, 30)',
                            'rgb(204, 0, 0)',
                            'rgb(255, 0, 0)',
                            'rgb(255, 0, 204)',
                            'rgb(255, 204, 204)',
                            'rgb(255, 153, 0)',
                            'rgb(255, 204, 0)',
                            'rgb(255, 255, 0)',
                            'rgb(204, 255, 0)',
                            'rgb(0, 255, 0)',
                            'rgb(53, 128, 0)',
                            'rgb(0, 0, 204)',
                            'rgb(102, 153, 255)',
                            'rgb(153, 204, 255)',
                            'rgb(0, 255, 255)',
                            'rgb(204, 255, 255)',
                            'rgb(153, 0, 204)',
                            'rgb(204, 51, 255)',
                            'rgb(204, 153, 255)',
                            'rgb(102, 102, 102)',
                            'rgb(255, 102, 102)',
                            'rgb(102, 102, 255)'
                        ]
                    },
                    opacity: { value: 0.5 },
                    width: 1000,
                    height: 430
                }
            ]
        },
        {
            xLinkingId: 'bottom',
            tracks: [
                {
                    id: 'view-3',
                    template: 'ideogram',
                    data: {
                        url:
                            'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                        type: 'csv',
                        chromosomeField: 'Chromosome',
                        genomicFields: ['chromStart', 'chromEnd']
                    },
                    encoding: {
                        startPosition: { field: 'chromStart', axis: 'bottom' },
                        endPosition: { field: 'chromEnd' },
                        stainBackgroundColor: {
                            field: 'Stain',
                            range: ['#E3E3E3', 'lightgray', 'gray', 'gray', 'black', '#7B9CC8', '#DC4542']
                        },
                        stainLabelColor: { field: 'Stain' },
                        name: { field: 'Name' },
                        stainStroke: { value: 'black' },
                        stainStrokeWidth: { value: 0 } // Let's not use strokes for a while
                    },
                    width: 1000,
                    height: 20
                }
            ]
        }
    ]
};
