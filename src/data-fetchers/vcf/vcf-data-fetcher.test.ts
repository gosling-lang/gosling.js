import { recordToTile } from './vcf-data-fetcher';
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
        const prevPos = chrPos - 100;
        const tile = recordToTile(record, chrPos, prevPos);

        expect(tile.MUTTYPE).toBe('substitution');
        expect(tile.SUBTYPE).toBe('G>A');
        expect(tile.DISTPREV).toBe(chrPos + record.POS - prevPos);
        expect(tile.NS).toBe(3);
    });
});
