import { Track, Channel, GenericType, IsGlyphMark, IsChannelValue, ChannelTypes, ChannelBind, MarkGlyph, IsChannelDeep, ChannelDeep, Datum, ChannelType, GlyphElement, IsChannelBind } from "../gemini.schema";
import { deepToLongElements } from "../utils/spec-preprocess";
import * as d3 from "d3";
import { BoundingBox } from "../visualizations/bounding-box";

export class TrackModel {
    private track: Track | GenericType<Channel>;
    private channelToField: { [k: string]: string };
    private domains: { [channel: string]: (string | number)[] };
    private scales: { [channel: string]: d3.ScaleLinear<any, any> | d3.ScaleOrdinal<any, any> | d3.ScaleSequential<any> };
    private ranges: { [channel: string]: number[] };
    constructor(track: Track | GenericType<Channel>) {
        this.track = track;
        this.domains = {};
        this.channelToField = {};
        this.scales = {};
        this.ranges = {};

        /**
         * Validate
         */
        // TODO: Check if required channels are specified.
        // ...

        /**
         * Default
         */
        if (IsGlyphMark(track.mark)) {
            track.mark.elements = deepToLongElements(track.mark.elements);
        }

        /**
         * Prepare Rendering
         */
        this.setDomains();
    }
    public getTrack() {
        return this.track;
    }

    public getElements() {
        if (IsGlyphMark(this.track.mark)) {
            return this.track.mark.elements;
        }
        return [];
    }

    public getFieldByChannel(field: string) {
        return this.channelToField[field];
    }

    private setDomains() {
        const data = this.track.data as Datum[];

        if (IsGlyphMark(this.track.mark)) {
            const { requiredChannels: required } = this.track.mark;

            // Add channel-to-domain mappings when `field` suggested.
            required.forEach(c => {
                const channel = (this.track as GenericType<Channel>)[c];
                if (IsChannelDeep(channel)) {
                    const { field } = channel;
                    this.channelToField[c] = field;

                    // Domains for x1 and y1 needs to be added to that of x and y, respectively.
                    const targetChannel = c === 'x1' ? 'x' : c === 'y1' ? 'y' : c;

                    if (!this.domains[targetChannel]) {
                        this.domains[targetChannel] = [];
                    }
                    this.domains[targetChannel] = [
                        ...this.domains[targetChannel],
                        ...data.map(d => d[field])
                    ]
                }
            });
            Object.keys(this.domains).forEach(c => {
                const channel = (this.track as GenericType<Channel>)[c];
                if (IsChannelDeep(channel)) {
                    const { type } = channel;
                    this.domains[c] = type === "nominal"
                        ? d3.set(this.domains[c]).values()
                        : d3.extent(this.domains[c] as number[]) as [number, number]
                }
            });
        }
    }

    private setRanges(bb: BoundingBox) {
        Object.keys(this.domains).forEach(c => {
            const channel = (this.track as GenericType<Channel>)[c];
            if (IsChannelDeep(channel)) {
                if (c === 'x') {
                    this.ranges['x'] = [bb.x, bb.x1];
                } else if (c === 'y') {
                    this.ranges['y'] = [bb.y, bb.y1];
                } else if (c === 'color') {
                    this.ranges['color'] = [-1, -1]
                } else {
                    // TODO: Support specifying `range` and `domain`.
                    // ...
                }
            }
        });
    }

    public setScales(boundingBox: BoundingBox) {
        this.setRanges(boundingBox);
        Object.keys(this.domains).forEach(c => {
            const channel = (this.track as GenericType<Channel>)[c];
            if (IsChannelDeep(channel)) {
                const { type } = channel;
                if (this.ranges[c]) {
                    // TODO: simplify
                    this.scales[c] = c === 'color' && type === 'nominal'
                        ? d3.scaleOrdinal()
                            .domain(this.domains[c] as string[])
                            .range(d3.schemeTableau10)
                        : c === 'color' && type === 'quantitative'
                            ? d3.scaleSequential(d3.interpolateBrBG)
                                .domain(this.domains[c] as [number, number])
                            : type === "nominal"
                                ? d3.scaleOrdinal()
                                    .domain(this.domains[c] as string[])
                                    .range(this.ranges[c])
                                : d3.scaleLinear()
                                    .domain(this.domains[c] as [number, number])
                                    .range(this.ranges[c]);
                }
            }
        });
    }

    public getEncoding(
        element: GlyphElement /* Remove this */,
        c: keyof typeof ChannelTypes,
        datum: Datum
    ) {
        // TODO: Move out
        const DEFAULT_ENCODING: { [k: string]: number | string } = {
            'opacity': 1,
            'size': 10,
            'color': 'black',
            'text': ''
        }
        ////

        const scaleChannel = c === 'x1' ? 'x' : c === 'y1' ? 'y' : c;

        if (IsChannelValue(element[c])) {
            switch (c) {
                case 'size':
                case 'opacity':
                case 'color':
                case 'text':
                    return (element[c] as any).value;
            }
        }
        else if (IsChannelValue(this.track[c])) {
            switch (c) {
                case 'size':
                case 'opacity':
                case 'color':
                case 'text':
                    return (this.track[c] as any).value;
            }
        }
        else if (this.scales[scaleChannel]) {
            const field = IsChannelBind(element[c])
                ? this.getFieldByChannel((element[c] as ChannelBind).bind)
                : this.getFieldByChannel(c);
            return this.scales[scaleChannel](datum[field] as any);
        } else if (c === 'text') {
            const field = IsChannelBind(element.text)
                ? this.getFieldByChannel(element.text.bind)
                : IsChannelDeep(this.track.text)
                    ? this.track.text.field
                    : undefined;
            if (field) {
                return datum[field];
            }
        }
        else {
            // If not specified, use default value.
            return DEFAULT_ENCODING[c];
        }
    }

    public getScale(c: ChannelType | string) {
        return this.scales[c];
    }
}