import BedParser from './bed-parser';

describe('BED parser with default columns', () => {
    const parser = new BedParser();
    const bedLine =
        'chr1\t11868\t14409\tENST00000456328.2\t0\t+\t11868\t11868\t0,0,0\t3\t359,109,1189\t0,744,1352\t14409';

    it('can parse a line correctly', () => {
        const parsed = parser.parseLine(bedLine, 0);
        expect(parsed).toMatchInlineSnapshot(`
              {
                "blockCount": 3,
                "blockSizes": [
                  359,
                  109,
                  1189,
                ],
                "blockStarts": [
                  0,
                  744,
                  1352,
                ],
                "chrom": "chr1",
                "chromEnd": 14410,
                "chromStart": 11869,
                "itemRgb": "0,0,0",
                "name": "ENST00000456328.2",
                "score": 0,
                "strand": 1,
                "thickEnd": 11869,
                "thickStart": 11869,
              }
            `);
    });
});

describe('BED parser with custom columns', () => {
    const n_columns = 7;
    const customFields = ['custom6', 'custom7'];
    const parser = new BedParser({ customFields, n_columns });
    const bedLine = 'chr1\t11868\t14409\tENST00000456328.2\t0\t+\t11868';
    const bedLineExtraColumn = 'chr1\t11868\t14409\tENST00000456328.2\t0\t+\t11868\t12334';
    const chromStart = 100;

    it('can generate autoSql schema', () => {
        const autoSqlSchema = parser.constructBedAutoSql();
        expect(autoSqlSchema).toMatchInlineSnapshot(`
          "table customBedSchema
          \\"BED12\\"
              (
              string chrom; \\"custom input\\"
              uint chromStart; \\"custom input\\"
              uint chromEnd; \\"custom input\\"
              string name; \\"custom input\\"
              float score; \\"custom input\\"
              string custom6; \\"custom input\\"
              string custom7; \\"custom input\\"
              )"
        `);
    });
    it('can parse a line correctly', () => {
        const parsed = parser.parseLine(bedLine, chromStart);
        expect(parsed).toMatchInlineSnapshot(`
              {
                "chrom": "chr1",
                "chromEnd": 14510,
                "chromStart": 11969,
                "custom6": "+",
                "custom7": "11868",
                "name": "ENST00000456328.2",
                "score": 0,
                "strand": 0,
              }
            `);
    });
    it('ignores extra columns in a line', () => {
        const parsed = parser.parseLine(bedLineExtraColumn, chromStart);
        expect(parsed).toMatchInlineSnapshot(`
              {
                "chrom": "chr1",
                "chromEnd": 14510,
                "chromStart": 11969,
                "custom6": "+",
                "custom7": "11868",
                "name": "ENST00000456328.2",
                "score": 0,
                "strand": 0,
              }
            `);
    });
});
