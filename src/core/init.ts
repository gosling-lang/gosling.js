// @ts-ignore
import { default as higlassRegister } from 'higlass-register';
// @ts-ignore
import { TextTrack } from 'higlass-text';
import { AxisTrack } from '../gosling-genomic-axis';
import { BrushTrack } from '../gosling-brush';
import { CSVDataFetcher } from '../data-fetcher/csv/index';
import { RawDataFetcher } from '../data-fetcher/json/index';
import { BBIDataFetcher } from '../data-fetcher/bigwig/index';
import { GoslingTrack } from '../gosling-track/index';

/**
 * Register plugin tracks and data fetchers to HiGlass. This is necessary for the first time before using Gosling.js.
 */
export function init() {
    /**
     * Register a linear Gosling.js track to HiGlassComponent
     */
    higlassRegister({
        name: 'GoslingTrack',
        track: GoslingTrack,
        config: GoslingTrack.config
    });

    /**
     * Register a 2D Gosling.js track to HiGlassComponent
     */
    higlassRegister({
        name: 'Gosling2DTrack',
        track: GoslingTrack,
        config: {
            ...GoslingTrack.config,
            type: 'gosling-2d-track',
            orientation: '2d'
        }
    });

    /**
     * Register an axis plugin track to HiGlassComponent
     */
    higlassRegister({
        name: 'AxisTrack',
        track: AxisTrack,
        config: AxisTrack.config
    });

    /**
     * Register a higlass-text plugin track to HiGlassComponent
     */
    higlassRegister({
        name: 'TextTrack',
        track: TextTrack,
        config: TextTrack.config
    });

    /**
     * Register a brush plugin track to HiGlassComponent
     */
    higlassRegister({
        name: 'BrushTrack',
        track: BrushTrack,
        config: BrushTrack.config
    });

    /**
     * Register data fetchers to HiGlassComponent
     */
    higlassRegister({ dataFetcher: CSVDataFetcher, config: CSVDataFetcher.config }, { pluginType: 'dataFetcher' });
    higlassRegister({ dataFetcher: RawDataFetcher, config: RawDataFetcher.config }, { pluginType: 'dataFetcher' });
    higlassRegister({ dataFetcher: BBIDataFetcher, config: BBIDataFetcher.config }, { pluginType: 'dataFetcher' });
}
