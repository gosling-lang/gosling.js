import { GeminidSpec } from '../../core/geminid.schema';

export const EXAMPLE_CYTOAND_HG38: GeminidSpec = {
    layout: {
        type: 'linear',
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
                            { field: 'Stain', oneOf: ['acen'], not: false },
                            { field: 'Name', include: 'q', not: false }
                        ]
                    },
                    color: { value: '#B40101' }
                },
                {
                    mark: 'triangle-l',
                    dataTransform: {
                        filter: [
                            { field: 'Stain', oneOf: ['acen'], not: false },
                            { field: 'Name', include: 'p', not: false }
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
