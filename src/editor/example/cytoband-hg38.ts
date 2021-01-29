import { GoslingSpec } from '../../core/gosling.schema';

export const EXAMPLE_CYTOAND_HG38: GoslingSpec = {
    layout: 'linear',
    arrangement: {
        direction: 'vertical',
        columnSizes: 800,
        rowSizes: 60
    },
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                type: 'csv',
                chromosomeField: 'Chromosome',
                genomicFields: ['chromStart', 'chromEnd']
            },
            superpose: [
                {
                    mark: 'text',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['acen'], not: true }]
                    },
                    text: { field: 'Name', type: 'nominal' },
                    color: {
                        field: 'Stain',
                        type: 'nominal',
                        domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                        range: ['black', 'black', 'black', 'black', 'white', 'black']
                    },
                    visibility: {
                        operation: 'less-than',
                        measure: 'width',
                        threshold: '|xe-x|',
                        transitionPadding: 10,
                        target: 'mark'
                    },
                    style: {
                        textStrokeWidth: 0
                    }
                },
                {
                    mark: 'rect',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['acen'], not: true }]
                    },
                    color: {
                        field: 'Stain',
                        type: 'nominal',
                        domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                        range: ['white', '#D9D9D9', '#979797', '#636363', 'black', '#A0A0F2']
                    }
                },
                {
                    mark: 'triangle-r',
                    dataTransform: {
                        filter: [
                            { field: 'Stain', oneOf: ['acen'] },
                            { field: 'Name', include: 'q' }
                        ]
                    },
                    color: { value: '#B40101' }
                },
                {
                    mark: 'triangle-l',
                    dataTransform: {
                        filter: [
                            { field: 'Stain', oneOf: ['acen'] },
                            { field: 'Name', include: 'p' }
                        ]
                    },
                    color: { value: '#B40101' }
                }
            ],
            x: { field: 'chromStart', type: 'genomic', domain: { chromosome: '1' }, axis: 'top' },
            xe: { field: 'chromEnd', type: 'genomic' },
            size: { value: 20 },
            stroke: { value: 'gray' },
            strokeWidth: { value: 0.5 },
            style: {
                outline: 'white'
            }
        }
    ]
};
