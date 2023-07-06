import type { GoslingSpec } from 'gosling.js';

export const GFF_DEMO: GoslingSpec = {
    title: 'GFF3 file',
    subtitle: 'Demonstration of a GFF3 file',
    spacing: 0,
    layout: 'linear',
    centerRadius: 0.5,
    style: { enableSmoothPath: true },
    views: [
        {
            xDomain: { chromosome: 'chr1', interval: [1250000, 1350000] },
            tracks: [
                {
                    template: 'gene',
                    data: {
                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/gff/gencode.v43.basic_sort.annotation.gff3.gz',
                        indexUrl:
                            'https://s3.amazonaws.com/gosling-lang.org/data/gff/gencode.v43.basic_sort.annotation.gff3.gz.tbi',
                        type: 'gff',
                        extractAttributes: true
                    },
                    encoding: {
                        startPosition: { field: 'start' },
                        endPosition: { field: 'end' },
                        strandColor: { field: 'strand', range: ['red', 'gray'] },
                        strandRow: { field: 'strand' },
                        opacity: { value: 0.4 },
                        geneHeight: { value: 10 },
                        geneLabel: { field: 'gene_name' },
                        geneLabelFontSize: { value: 10 },
                        geneLabelColor: { field: 'strand', range: ['gray'] },
                        geneLabelStroke: { value: 'white' },
                        geneLabelStrokeThickness: { value: 4 },
                        geneLabelOpacity: { value: 1 },
                        type: { field: 'type' }
                    },
                    width: 800,
                    height: 100
                }
            ]
        }
    ]
};
