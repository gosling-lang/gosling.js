import { IsFlatTracks, IsOverlaidTracks, IsStackedTracks, IsXAxis } from './gosling.schema.guards';

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
                        dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }],
                        encoding: {
                            color: {
                                field: 'Density',
                                type: 'nominal',
                                domain: ['', '25', '50', '75', '100'],
                                range: ['white', '#D9D9D9', '#979797', '#636363', 'black']
                            },
                            size: { value: 20 }
                        }
                    },
                    {
                        mark: 'rect',
                        dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['gvar'] }],
                        encoding: {
                            color: { value: '#A0A0F2' },
                            size: { value: 20 }
                        }
                    },
                    {
                        mark: 'triangleRight',
                        dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen-1'] }],
                        encoding: {
                            color: { value: '#B40101' },
                            size: { value: 20 }
                        }
                    },
                    {
                        mark: 'triangleLeft',
                        dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen-2'] }],
                        encoding: {
                            color: { value: '#B40101' },
                            size: { value: 20 }
                        }
                    },
                    {
                        mark: 'brush',
                        encoding: {
                            color: { value: 'red' },
                            opacity: { value: 1 },
                            strokeWidth: { value: 1 },
                            stroke: { value: 'red' }
                        }
                    }
                ],
                encoding: {
                    x: {
                        startField: 'Basepair_start',
                        endField: 'Basepair_stop',
                        type: 'genomic',
                        domain: { chromosome: '3' },
                        axis: 'none'
                    },
                    stroke: { value: 'black' },
                    strokeWidth: { value: 1 }
                },
                style: { outline: 'lightgray' },
                width: 550,
                height: 20
            })
        ).toEqual(false);
    });

    it('FlatTracks', () => {
        expect(IsFlatTracks({ tracks: [] })).toBe(true);
        expect(IsFlatTracks({ alignment: 'stack', tracks: [] })).toBe(false);
        expect(IsFlatTracks({ tracks: [{ alignment: 'overlay', tracks: [], width: 10, height: 10 }] })).toBe(false);
        expect(IsFlatTracks({ alignment: 'overlay', tracks: [], width: 10, height: 10 })).toBe(false);
    });
    it('StackedTracks', () => {
        expect(IsStackedTracks({ alignment: 'stack', tracks: [] })).toBe(true);
        expect(IsStackedTracks({ tracks: [{ alignment: 'overlay', tracks: [], width: 10, height: 10 }] })).toBe(true);
        expect(IsStackedTracks({ tracks: [] })).toBe(false);
        expect(IsStackedTracks({ alignment: 'overlay', tracks: [], width: 10, height: 10 })).toBe(false);
    });
    it('OverlaidTracks', () => {
        expect(IsOverlaidTracks({ alignment: 'overlay', tracks: [], width: 10, height: 10 })).toBe(true);
        expect(IsOverlaidTracks({ tracks: [{ alignment: 'overlay', tracks: [], width: 10, height: 10 }] })).toBe(false);
        expect(IsOverlaidTracks({ tracks: [] })).toBe(false);
        expect(IsOverlaidTracks({ alignment: 'stack', tracks: [] })).toBe(false);
    });
});
