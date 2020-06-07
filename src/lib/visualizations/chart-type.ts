import { Track, GenericType, Channel, IsChannelDeep } from "../gemini.schema";

export type ChartType =
    // ...
    | 'line-connection'
    | 'band-connection'
    | 'unknown'

export function getChartType(track: Track | GenericType<Channel>): ChartType {

    type PrimitiveChannel = 'x' | 'xe' | 'y' | 'ye';

    const xField = IsChannelDeep(track.x) ? track.x.field : undefined;
    const xeField = IsChannelDeep(track.xe) ? track.xe.field : undefined;
    const x1Field = IsChannelDeep(track.x1) ? track.x1.field : undefined;
    const x1eField = IsChannelDeep(track.x1e) ? track.x1e.field : undefined;
    const yField = IsChannelDeep(track.y) ? track.y.field : undefined;
    const yeField = IsChannelDeep(track.ye) ? track.ye.field : undefined;
    const y1Field = IsChannelDeep(track.y1) ? track.y1.field : undefined;
    const y1eField = IsChannelDeep(track.y1e) ? track.y1e.field : undefined;

    const numOfChannelsDefined: { [k in PrimitiveChannel]: number } = {
        x: [xField, xeField].filter(d => d).length,
        xe: [x1Field, x1eField].filter(d => d).length,
        y: [yField, yeField].filter(d => d).length,
        ye: [y1Field, y1eField].filter(d => d).length
    }

    if (track.mark === 'link-between') {
        const numPairOfChannelsDefined = Object.keys(numOfChannelsDefined).map(
            key => numOfChannelsDefined[key as PrimitiveChannel]
        ).filter(d => d >= 2).length;
        if (numPairOfChannelsDefined >= 2) {
            return 'band-connection';
        } else {
            return 'line-connection';
        }
    }
    return 'unknown';
}