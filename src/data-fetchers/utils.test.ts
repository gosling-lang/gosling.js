import type { Datum } from '@gosling-lang/gosling-schema';
import { filterUsingGenoPos } from './utils';

describe('Data Fetcher Utils', () => {
    it('Filter data based on genomic window', () => {
        const data: Datum[] = [
            { x: '1', xe: '2' }, // outside
            { x: '3', xe: '5' }, // partly overlap
            { x: '5', xe: '6' }, // entirely inside
            { x: '7', xe: '10' } // partly overlap
        ];
        const range: [number, number] = [4, 7];

        // Filtering based on two genomic fields
        expect(
            filterUsingGenoPos(data, range, {
                x: 'x',
                xe: 'xe'
            })
        ).toMatchInlineSnapshot(`
          [
            {
              "x": "3",
              "xe": "5",
            },
            {
              "x": "5",
              "xe": "6",
            },
            {
              "x": "7",
              "xe": "10",
            },
          ]
        `);

        // Filtering based on a single genomic field
        expect(
            filterUsingGenoPos(data, range, {
                x: 'x'
            })
        ).toMatchInlineSnapshot(`
          [
            {
              "x": "5",
              "xe": "6",
            },
            {
              "x": "7",
              "xe": "10",
            },
          ]
        `);
    });
});
