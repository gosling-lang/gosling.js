import { recordToTile } from './utils';
import type { VcfRecord } from './vcf-data-fetcher';

describe('VCF file parser', () => {
    it('Convert a VCF record to a tile data', () => {
        const record: VcfRecord = {
            CHROM: '20',
            POS: 14370,
            ID: ['rs6054257'],
            REF: 'G',
            ALT: ['A'],
            QUAL: 29,
            FILTER: 'PASS',
            INFO: {
                NS: [3],
                DP: [14],
                AF: ['0.5', 'DB', 'H2']
            }
        };
        const chrPos = 123456;
        const prevPos = record.POS - 100;
        const tile = recordToTile(record, chrPos, prevPos);

        expect(tile).toMatchInlineSnapshot(`
          {
            "AF": "0.5, DB, H2",
            "ALT": "A",
            "CHROM": "20",
            "DISTPREV": 100,
            "DISTPREVLOGE": 4.605170185988092,
            "DP": "14",
            "FILTER": "PASS",
            "ID": [
              "rs6054257",
            ],
            "INFO": "{\\"NS\\":[3],\\"DP\\":[14],\\"AF\\":[\\"0.5\\",\\"DB\\",\\"H2\\"]}",
            "MUTTYPE": "substitution",
            "NS": "3",
            "ORIGINALPOS": 14370,
            "POS": 137827,
            "POSEND": 137828,
            "QUAL": 29,
            "REF": "G",
            "SUBTYPE": "C>T",
          }
        `);
    });
});
