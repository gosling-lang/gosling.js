import { GeminiSpec } from '../../core/gemini.schema';

export const EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM: GeminiSpec = {
    tracks: [
        {
            data: {
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
                type: 'csv',
                chromosomeField: 'Chr.',
                genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop'],
                quantitativeFields: ['Band', 'Density']
            },
            semanticZoom: {
                type: 'alternative-encoding',
                spec: {
                    superpose: [
                        {
                            mark: 'text',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }]
                            },
                            text: { field: 'Band', type: 'nominal' },
                            color: { value: 'black' },
                            visibility: {
                                operation: 'less-than',
                                condition: { width: '|xe-x|', conditionPadding: 10 },
                                target: 'mark'
                            }
                        },
                        {
                            mark: 'rect',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }]
                            },
                            color: {
                                field: 'Density',
                                type: 'nominal',
                                domain: ['', '25', '50', '75', '100'],
                                range: ['white', '#D9D9D9', '#979797', '#636363', 'black']
                            }
                        },
                        {
                            mark: 'rect',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['gvar'], not: false }]
                            },
                            color: { value: '#A0A0F2' }
                        },
                        {
                            mark: 'triangle-l',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['acen-2'], not: false }]
                            },
                            color: { value: '#B40101' }
                        },
                        {
                            mark: 'triangle-r',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['acen-1'], not: false }]
                            },
                            color: { value: '#B40101' }
                        }
                    ],
                    x: { field: 'Basepair_start', type: 'genomic', domain: { chromosome: '1' }, axis: 'top' },
                    xe: { field: 'Basepair_stop', type: 'genomic' },
                    stroke: { value: 'black' },
                    strokeWidth: { value: 0.5 },
                    dataTransform: { filter: [] }
                },
                trigger: {
                    operation: 'greater-than',
                    condition: { zoomLevel: 1 },
                    target: 'track'
                }
            },
            superpose: [
                {
                    color: {
                        field: 'Chr.',
                        type: 'nominal',
                        range: ['#F6F6F6', 'lightgray']
                    },
                    x: {
                        field: 'Basepair_start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    xe: {
                        field: 'Basepair_stop',
                        type: 'genomic'
                    }
                },
                {
                    mark: 'rect',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['acen-2'], not: false }]
                    },
                    color: { value: '#B40101' }
                }
            ],
            mark: 'rect',
            x: {
                field: 'Basepair_start',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'Basepair_stop',
                type: 'genomic'
            },
            width: 1000,
            height: 60
        }
    ]
};
