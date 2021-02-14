import { aggregateData } from './data-transform';

describe('Should transform data correctly', () => {
    it('Aggregate', () => {
        const aggregated = aggregateData(
            {
                data: { type: 'csv', url: '' },
                mark: 'point',
                color: { field: 'c', type: 'nominal' },
                y: { field: 'q', type: 'quantitative', aggregate: 'max' },
                width: 100,
                height: 100
            },
            [
                { c: 'a', q: 1 },
                { c: 'a', q: 3 },
                { c: 'b', q: 4 }
            ]
        );
        expect(aggregated).toHaveLength(2);
        expect(aggregated.filter(d => d['c'] === 'a')[0]['q']).toEqual(3);
        expect(aggregated.filter(d => d['c'] === 'b')[0]['q']).toEqual(4);

        const noChange = aggregateData(
            {
                data: { type: 'csv', url: '' },
                mark: 'point',
                // no categorical field should not work
                y: { field: 'q', type: 'quantitative', aggregate: 'max' },
                width: 100,
                height: 100
            },
            [
                { c: 'a', q: 1 },
                { c: 'a', q: 3 },
                { c: 'b', q: 4 }
            ]
        );
        expect(noChange).toHaveLength(3);
    });
});
