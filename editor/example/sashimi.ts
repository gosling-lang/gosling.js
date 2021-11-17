import { GoslingSpec } from 'gosling.js';

export const EX_SPEC_SASHIMI: GoslingSpec = {
    title: 'Sashimi Plot',
    subtitle: 'Sashimi plot based on a juction annotation file',
    xDomain: { chromosome: '22', interval: [14103, 110000] },
    description: 'https://regtools.readthedocs.io/en/latest/commands/junctions-annotate/',
    tracks: [
        {
            data: {
                type: 'csv',
                // reference: https://raw.githubusercontent.com/griffithlab/regtools/master/tests/integration-test/data/junctions-annotate/expected-annotate.out
                url: 'https://s3.amazonaws.com/gosling-lang.org/data/sashimi/junction-annotation.csv',
                separator: '\t',
                chromosomeField: 'chrom',
                genomicFields: ['start', 'end'],
                quantitativeFields: ['score']
            },
            alignment: 'overlay',
            tracks: [
                { mark: 'withinLink' },
                {
                    mark: 'text',
                    text: { field: 'score', type: 'nominal' },
                    stroke: { value: 'white' },
                    strokeWidth: { value: 3 },
                    color: { value: 'black' },
                    opacity: { value: 1 },
                    visibility: [
                        {
                            target: 'mark',
                            threshold: '|xe-x|',
                            operation: 'LT',
                            measure: 'width',
                            transitionPadding: 10
                        }
                    ]
                }
            ],
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            y: { field: 'score', type: 'quantitative' },
            // color: { field: 'name', type: 'nominal', range: ['blue', 'red'], legend: true },
            stroke: { value: 'orange' }, // { field: 'name', type: 'nominal', range: ['blue', 'red']},
            strokeWidth: { field: 'score', type: 'quantitative', range: [1, 6] },
            opacity: { value: 0.8 },
            width: 800,
            height: 200,
            style: { flatWithinLink: true }
        }
        // Not aligned, perhaps the assembly is different
        // EX_SPEC_GENE_TRANSCRIPT
    ]
};
