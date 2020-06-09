import { BoundingBox } from "../utils/bounding-box";
import { Track, GenericType, Channel, IsChannelDeep, Datum, IsChannelValue, IsDataDeep } from "../gemini.schema";
import * as d3 from 'd3'
import { validateBetweenLinkSpec } from "./link-validate";
import { getChartType } from "./chart-type";
import { renderBetweenLineLink } from "./line-connection";
import { renderBetweenBandLink } from "./band-connection";

export type LinkPosition =
    | 'left-bottom'
    | 'left-top'
    | 'left-right'
    | 'top-right'
    | 'top-bottom'
    | 'right-bottom'
    | 'unknown'

export interface LinkStyle { // TODO: Extend general styles.
    fill?: string
    stroke?: string
    strokeWidth?: number
    opacity?: number
}

export const DEFAULT_LINK_STYLE: Required<LinkStyle> = {
    fill: 'lightgray',
    stroke: 'gray',
    strokeWidth: 1,
    opacity: 0.7
} as const

export const LinkChannelToStyleMap: { [k: string]: keyof typeof DEFAULT_LINK_STYLE } = {
    color: 'fill',
    stroke: 'stroke',
    strokeWidth: 'strokeWidth',
    opacity: 'opacity'
}

export class LinkStyleModel {
    private style: Required<LinkStyle>;
    constructor(track: Track | GenericType<Channel>) {
        this.style = { ...DEFAULT_LINK_STYLE };
        // Fill styles using spec.
        Object.keys(LinkChannelToStyleMap).forEach(c => {
            const channel = (track as GenericType<Channel>)[c];
            if (IsChannelValue(channel)) {
                (this.style[LinkChannelToStyleMap[c]] as any /* TODO: */) = channel.value;
            }
        })
    }
    public getStyle() {
        return this.style;
    }
}

export function getLinkPosition(track: Track | GenericType<Channel>): LinkPosition {
    const xField = IsChannelDeep(track.x) ? track.x.field : undefined;
    const x1Field = IsChannelDeep(track.x1) ? track.x1.field : undefined;
    const yField = IsChannelDeep(track.y) ? track.y.field : undefined;
    const y1Field = IsChannelDeep(track.y1) ? track.y1.field : undefined;

    if (xField && yField) return 'left-bottom';
    else if (x1Field && yField) return 'left-top';
    else if (x1Field && y1Field) return 'top-right';
    else if (xField && y1Field) return 'right-bottom';
    else if (xField && x1Field) return 'top-bottom';
    else if (yField && y1Field) return 'left-right';
    else return 'unknown';
}

export function renderBetweenLink(
    g: d3.Selection<SVGGElement, any, any, any>,
    tracksWithBB: { boundingBox: BoundingBox, track: Track | GenericType<Channel> }[]
) {
    tracksWithBB.forEach(tb => {
        // validate
        const valid = validateBetweenLinkSpec(tb.track);
        if (!valid.isValid()) {
            valid.printValidity();
            return;
        }
        // render
        switch (getChartType(tb.track)) {
            case 'line-connection':
                if (IsDataDeep(tb.track.data)) {
                    d3.csv(tb.track.data.url).then(data =>
                        renderBetweenLineLink(g, { ...tb.track, data } as Track, tb.boundingBox)
                    )
                }
                break;
            case 'band-connection':
                if (IsDataDeep(tb.track.data)) {
                    d3.csv(tb.track.data.url).then(data =>
                        renderBetweenBandLink(g, { ...tb.track, data } as Track, tb.boundingBox)
                    )
                }
                break;
            default:
                break;
        }
    });
}