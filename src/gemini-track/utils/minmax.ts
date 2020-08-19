import { Track, IsChannelDeep } from '../../lib/gemini.schema';
import * as d3 from 'd3';
import { group } from 'd3-array';

// TODO: support vertical tracks
export function findValueExtent(track: Track, data: { [k: string]: string | number }[]) {
    const extent: { min: number | undefined; max: number | undefined } = { min: undefined, max: undefined };

    let xField: string | undefined;
    let yField: string | undefined;
    let colorField: string | undefined;
    let rowField: string | undefined;
    if (IsChannelDeep(track.color)) {
        colorField = track.color.field;
    }
    if (IsChannelDeep(track.x)) {
        xField = track.x.field;
    }
    if (IsChannelDeep(track.y)) {
        yField = track.y.field;
    }
    if (IsChannelDeep(track.row)) {
        rowField = track.row.field;
    }

    const stackedMark =
        (track.mark === 'bar' || track.mark === 'area') && colorField && colorField !== xField && !rowField;

    if (stackedMark) {
        const pivotedData = group(data, d => d[xField as string]);
        const xKeys = [...pivotedData.keys()];
        extent.min = 0; // TODO: we can support none-zero base line
        extent.max = d3.max(
            xKeys.map(d => d3.sum((pivotedData.get(d) as any).map((_d: any) => _d[yField as string]))) as number[]
        );
    } else {
        extent.min = 0; // TODO: we can support none-zero base line
        extent.max = d3.max(data.map(d => d[yField as string] as number));
    }
    return extent;
}
