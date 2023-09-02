import { recordToTile } from './utils';
import type { VcfRecord } from './vcf-data-fetcher';

describe('VCF file parser', () => {
    it('Convert a VCF record to a tile data', () => {
        const chrPos = 123456;
        const record: VcfRecord = {
            CHROM: '20',
            POS: chrPos + 14370,
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
        const prevPos = record.POS - 100;
        const tile = recordToTile(record, chrPos, prevPos);

        expect(tile).toMatchInlineSnapshot(`
          {
            "AF": "0.5, DB, H2",
            "ALT": "A",
            "CHROM": "20",
            "DISTPREV": 123557,
            "DISTPREVLOGE": 11.724457867035593,
            "DP": "14",
            "FILTER": "PASS",
            "ID": [
              "rs6054257",
            ],
            "INFO": "{\\"NS\\":[3],\\"DP\\":[14],\\"AF\\":[\\"0.5\\",\\"DB\\",\\"H2\\"]}",
            "MUTTYPE": "substitution",
            "NS": "3",
            "ORIGINALPOS": 137826,
            "POS": 261283,
            "POSEND": 261284,
            "QUAL": 29,
            "REF": "G",
            "SUBTYPE": "C>T",
          }
        `);
    });
});
