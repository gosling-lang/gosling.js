import { HiGlassModel } from '../../src/core/higlass-model';
import { CHROM_RANGE_HG19 } from '../../src/core/utils/chrom-size';

describe('Should produce higlass model correctly', () => {
    it('Should set default values correctly', () => {
        const higlass = new HiGlassModel();
        expect(higlass.spec().editable).toEqual(false);
    });

    it('Should set domain correctly', () => {
        const higlass = new HiGlassModel();
        higlass.setDomain({ chromosome: '2' }, { chromosome: '2', interval: [100, 200] });
        expect(higlass.spec().views?.[0].initialXDomain).toEqual(CHROM_RANGE_HG19['chr2']);
        expect(higlass.spec().views?.[0].initialYDomain?.[0]).toEqual(CHROM_RANGE_HG19['chr2'][0] + 100);
        expect(higlass.spec().views?.[0].initialYDomain?.[1]).toEqual(CHROM_RANGE_HG19['chr2'][0] + 200);
    });

    it('Should validate higlass spec correctly', () => {
        const higlass = new HiGlassModel();
        expect(higlass.validateSpec()).toEqual(true);
    });
});
