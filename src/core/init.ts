// @ts-ignore
import { default as higlassRegister } from 'higlass-register';
// @ts-ignore
import { TextTrack } from 'higlass-text';
import { AxisTrack } from '../axis-track';
import { BrushTrack } from '../higlass-brush-track';
import { CSVDataFetcher } from '../higlass-csv-datafetcher/index';
import { RawDataFetcher } from '../higlass-raw-datafetcher/index';
import { GoslingTrack } from '../gosling-track/index';

/**
 * Register plugin tracks and data fetchers to HiGlass. This is necessary for the first time before using Gosling.js.
 */
export function init() {
    /**
     * Register a Gosling plugin track to HiGlassComponent
     */
    higlassRegister({
        name: 'GoslingTrack',
        track: GoslingTrack,
        config: GoslingTrack.config
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

    // TODO:
    higlassRegister({
        name: 'BrushTrack',
        track: BrushTrack,
        config: BrushTrack.config
    });

    /**
     * Register a Gosling data fetcher to HiGlassComponent
     */
    higlassRegister({ dataFetcher: CSVDataFetcher, config: CSVDataFetcher.config }, { pluginType: 'dataFetcher' });
    higlassRegister({ dataFetcher: RawDataFetcher, config: RawDataFetcher.config }, { pluginType: 'dataFetcher' });
}
