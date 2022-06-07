import { getChromInterval, getChromTotalSize, getRelativeGenomicPosition, GET_CHROM_SIZES } from './assembly';
import { CHROM_SIZE_HG38 } from './chrom-size';

describe('Assembly', () => {
    it('Random chromosome name', () => {
        expect(GET_CHROM_SIZES().total).toBeDefined();
        expect(GET_CHROM_SIZES('chrmosome1').total).toBeDefined();
        expect(GET_CHROM_SIZES('random').total).toBeDefined();
    });
    it('hg38 ChromSizes', () => {
        expect(GET_CHROM_SIZES('hg38').size).toEqual(CHROM_SIZE_HG38);
    });
    it('Chromosome total size calculation', () => {
        expect(getChromTotalSize({ 1: 1, 2: 999 })).toEqual(1000);
    });
    it('Chromosome interval calculation', () => {
        expect(getChromInterval({ 1: 111, 2: 222 })).toEqual({ 1: [0, 111], 2: [111, 333] });
    });
    it('Absolute to relative genomic position', () => {
        expect(getRelativeGenomicPosition(CHROM_SIZE_HG38.chr1 + 1, 'hg38')).toEqual({
            chromosome: 'chr2',
            position: 1
        });
    });
});
