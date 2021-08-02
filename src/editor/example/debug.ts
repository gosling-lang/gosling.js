import { GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_DEBUG: GoslingSpec = {
    title: 'Track Template In Gosling.js',
    subtitle: 'Gosling.js enables track templates! This allows to create complex visualization more easily.',
    spacing: 0,
    // layout: 'circular', // TODO: support this!
    views: [
        {
            xDomain: { chromosome: '3', interval: [52168000, 52890000] },
            tracks: [
                {
                    template: 'gene',
                    data: {
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
                    },
                    encoding: {
                        startPosition: { field: 'start' },
                        endPosition: { field: 'end' },
                        strandColor: { field: 'strand', range: ['gray'] },
                        strandRow: { field: 'strand' },
                        opacity: { value: 0.4 },
                        geneHeight: { value: 30 },
                        geneLabel: { field: 'name' },
                        geneLabelFontSize: { value: 30 },
                        geneLabelColor: { field: 'strand', range: ['gray'] },
                        geneLabelStroke: { value: 'white' },
                        geneLabelStrokeThickness: { value: 4 },
                        geneLabelOpacity: { value: 1 },
                        type: { field: 'type' }
                    },
                    width: 800,
                    height: 300
                }
            ]
        },
        {
            xDomain: { chromosome: '1' },
            tracks: [
                {
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
                        stainBackgroundColor: { field: 'Stain' },
                        stainLabelColor: { field: 'Stain' },
                        name: { field: 'Name' },
                        stainStroke: { value: 'black' }
                    },
                    width: 800,
                    height: 100
                }
            ]
        }
    ]
};
