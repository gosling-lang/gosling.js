import { HiGlassModel } from '../../src/core/higlass-model';
import { CHROMOSOME_INTERVAL_HG38 } from '../../src/core/utils/chrom-size';

describe('Should produce higlass model correctly', () => {
    it('Should set default values correctly', () => {
        const higlass = new HiGlassModel();
        expect(higlass.spec().editable).toEqual(false);
    });

    it('Should set domain correctly', () => {
        const higlass = new HiGlassModel();
        higlass.addDefaultView();
        higlass.setDomain({ chromosome: '2' }, { chromosome: '2', interval: [100, 200] });
        expect(higlass.spec().views?.[0].initialXDomain).toEqual(CHROMOSOME_INTERVAL_HG38['chr2']);
        expect(higlass.spec().views?.[0].initialYDomain?.[0]).toEqual(CHROMOSOME_INTERVAL_HG38['chr2'][0] + 100);
        expect(higlass.spec().views?.[0].initialYDomain?.[1]).toEqual(CHROMOSOME_INTERVAL_HG38['chr2'][0] + 200);
    });

    it('Should set empty track correctly', () => {
        const higlass = new HiGlassModel();
        higlass.addDefaultView();
        higlass.setEmptyTrack(10, 10);
        expect(higlass.spec().views?.[0].tracks.center?.[0].type).toEqual('empty');
    });

    it('Should add brush correctly', () => {
        const higlass = new HiGlassModel();
        higlass.addDefaultView();
        higlass.addBrush(higlass.getLastView().uid ?? '', 'from');
        expect(JSON.stringify(higlass.spec())).toContain('viewport-projection-horizontal');
    });

    it('Should validate higlass spec correctly', () => {
        const higlass = new HiGlassModel();
        expect(higlass.validateSpec()).toEqual(true);
    });
});
