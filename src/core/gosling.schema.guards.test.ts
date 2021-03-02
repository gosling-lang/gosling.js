import { IsXAxis } from './gosling.schema.guards';

describe('Type Guard', () => {
    it('IsAxis', () => {
        expect(
            IsXAxis({
                title: 'chr3',
                data: {
                    url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
                    type: 'csv',
                    chromosomeField: 'Chr.',
                    genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop'],
                    quantitativeFields: ['Band', 'Density']
                },
                overlay: [
                    {
                        mark: 'rect',
                        dataTransform: { filter: [{ field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }] },
                        color: {
                            field: 'Density',
                            type: 'nominal',
                            domain: ['', '25', '50', '75', '100'],
                            range: ['white', '#D9D9D9', '#979797', '#636363', 'black']
                        },
                        size: { value: 20 }
                    },
                    {
                        mark: 'rect',
                        dataTransform: {
                            filter: [{ field: 'Stain', oneOf: ['gvar'] }]
                        },
                        color: { value: '#A0A0F2' },
                        size: { value: 20 }
                    },
                    {
                        mark: 'triangleRight',
                        dataTransform: {
                            filter: [{ field: 'Stain', oneOf: ['acen-1'] }]
                        },
                        color: { value: '#B40101' },
                        size: { value: 20 }
                    },
                    {
                        mark: 'triangleLeft',
                        dataTransform: {
                            filter: [{ field: 'Stain', oneOf: ['acen-2'] }]
                        },
                        color: { value: '#B40101' },
                        size: { value: 20 }
                    },
                    {
                        mark: 'brush',
                        color: { value: 'red' },
                        opacity: { value: 1 },
                        strokeWidth: { value: 1 },
                        stroke: { value: 'red' }
                    }
                ],
                x: { field: 'Basepair_start', type: 'genomic', domain: { chromosome: '3' }, axis: 'none' },
                xe: { field: 'Basepair_stop', type: 'genomic' },
                stroke: { value: 'black' },
                strokeWidth: { value: 1 },
                style: { outline: 'lightgray' },
                width: 550,
                height: 20
            })
        ).toEqual(false);
    });
});
