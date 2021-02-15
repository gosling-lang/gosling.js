import { GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';
import { EX_TRACK_GENE_ANNOTATION } from './gene-annotation';

export const EX_SPEC_PATHOGENIC: GoslingSpec = {
    xDomain: { chromosome: '3', interval: [10000000, 10150000] },
    parallelViews: [
        {
            spacing: 20,
            tracks: [
                {
                    ...EX_TRACK_GENE_ANNOTATION.higlass,
                    title: 'Gene',
                    style: { outline: 'black' },
                    width: 700,
                    height: 100
                },
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.clinvar,
                        type: 'bed',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
                    },
                    overlay: [
                        {
                            mark: 'bar',
                            color: { value: 'lightgray' },
                            stroke: { value: 'lightgray' },
                            strokeWidth: { value: 2 },
                            opacity: { value: 0.8 },
                            size: { value: 1 }
                        },
                        {
                            mark: 'point',
                            size: { value: 6 },
                            color: {
                                field: 'significance',
                                type: 'nominal',
                                domain: [
                                    'Pathogenic',
                                    'Pathogenic/Likely_pathogenic',
                                    'Likely_pathogenic',
                                    'Uncertain_significance',
                                    'Likely_benign',
                                    'Benign/Likely_benign',
                                    'Benign'
                                ],
                                range: ['#CB7AA7', '#CB7AA7', '#CB7AA7', '#606060', '#029F73', '#029F73', '#029F73'],
                                legend: true
                            }
                        }
                    ],
                    x: {
                        field: 'start',
                        type: 'genomic'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    y: {
                        field: 'significance',
                        type: 'nominal',
                        domain: [
                            'Pathogenic',
                            'Pathogenic/Likely_pathogenic',
                            'Likely_pathogenic',
                            'Uncertain_significance',
                            'Likely_benign',
                            'Benign/Likely_benign',
                            'Benign'
                        ],
                        baseline: 'Uncertain_significance',
                        range: [150, 20], // TODO: support more accurate positioning
                        grid: true
                    },
                    opacity: { value: 0.8 },
                    style: { outline: 'black' },
                    width: 700,
                    height: 150
                },
                {
                    title: 'Cistrome Data',
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        column: 'position',
                        row: 'sample',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4', 'sample 5', 'sample 6'],
                        bin: 2
                    },
                    mark: 'bar',
                    x: {
                        field: 'start',
                        type: 'genomic'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    color: {
                        field: 'sample',
                        type: 'nominal',
                        legend: true
                    },
                    row: {
                        field: 'sample',
                        type: 'nominal'
                    },
                    y: {
                        field: 'peak',
                        type: 'quantitative'
                    },
                    style: { outline: 'black' },
                    width: 700,
                    height: 150
                }
            ]
        }
    ]
};
