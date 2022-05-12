import { filterData, calculateData, aggregateData, splitExon } from './data-transform';

describe('Data Transformation', () => {
    it('Filter', () => {
        let filtered = filterData({ type: 'filter', field: 'c', oneOf: ['a'] }, [
            { c: 'a', q: 1 },
            { c: 'a', q: 3 },
            { c: 'b', q: 4 }
        ]);
        filtered = filterData({ type: 'filter', field: 'q', inRange: [1, 3.5] }, filtered);
        expect(filtered).toHaveLength(2);
        expect(filtered.filter(d => d['c'] === 'b')).toHaveLength(0);
        expect(filtered.filter(d => d['q'] === 4)).toHaveLength(0);
    });
    it('Log', () => {
        {
            const log = calculateData({ type: 'log', field: 'q', base: 2 }, [
                { c: 'a', q: 1 },
                { c: 'a', q: 3 },
                { c: 'b', q: 4 }
            ]);
            expect(log).toHaveLength(3);
            expect(log.filter(d => d['c'] === 'b')[0]['q']).toBeCloseTo(Math.log2(4), 10);
        }
        {
            // default base is 10
            const log = calculateData({ type: 'log', field: 'q' }, [
                { c: 'a', q: 1 },
                { c: 'a', q: 3 },
                { c: 'b', q: 4 }
            ]);
            expect(log).toHaveLength(3);
            expect(log.filter(d => d['c'] === 'b')[0]['q']).toBeCloseTo(Math.log10(4), 10);
        }
    });
    it('Exon Split', () => {
        {
            const exon = splitExon(
                {
                    type: 'exonSplit',
                    separator: ',',
                    flag: { field: 'type', value: 'exon' },
                    fields: [
                        { field: 'es', type: 'genomic', newField: 'es', chrField: 'c' },
                        { field: 'ee', type: 'genomic', newField: 'ee', chrField: 'c' }
                    ]
                },
                [{ c: 'chr3', es: '1,2,3', ee: '2,3,4' }],
                'hg38'
            );
            expect(exon).toHaveLength(4);
            expect(exon[0]).toEqual({ c: 'chr3', es: '1,2,3', ee: '2,3,4' });
            expect(exon.filter(d => d['type'] === 'exon')).toHaveLength(3);
        }
        {
            // default base is 10
            const log = calculateData({ type: 'log', field: 'q' }, [
                { c: 'a', q: 1 },
                { c: 'a', q: 3 },
                { c: 'b', q: 4 }
            ]);
            expect(log).toHaveLength(3);
            expect(log.filter(d => d['c'] === 'b')[0]['q']).toBeCloseTo(Math.log10(4), 10);
        }
    });
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
