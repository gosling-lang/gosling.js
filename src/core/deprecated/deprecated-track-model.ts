import * as d3 from 'd3';
import { ChannelBind, ChannelType, ChannelTypes, Datum, GlyphElement, BasicSingleTrack } from '../gosling.schema';
import { IsGlyphMark, IsChannelDeep, IsDomainFlat, IsChannelValue, IsChannelBind } from '../gosling.schema.guards';
import { BoundingBox } from '../utils/bounding-box';

/**
 * Domains and ranges in conditional marks are moved into `select` option for the compiling simplicity.
 * @param elements
 */
export function deepToLongElements(elements: GlyphElement[]) {
    const longElements: GlyphElement[] = [];
    elements.forEach(element => {
        if (typeof element.mark === 'object') {
            const { bind } = element.mark;
            for (let i = 0; i < element.mark.domain.length; i++) {
                const domain = element.mark.domain[i];
                const range = element.mark.range[i];
                const select = element.select ? element.select : [];
                longElements.push({
                    ...element,
                    mark: range,
                    select: [...select, { channel: bind, oneOf: [domain] }]
                });
            }
        } else {
            longElements.push(element);
        }
    });
    return longElements;
}

// deprecated
export class TrackModel {
    private track: BasicSingleTrack;
    private channelToField: { [k: string]: string };
    private domains: { [channel: string]: (string | number)[] };
    private scales: {
        [channel: string]: d3.ScaleLinear<any, any> | d3.ScaleOrdinal<any, any> | d3.ScaleSequential<any>;
    };
    private ranges: { [channel: string]: string | number[] | string[] };
    constructor(track: BasicSingleTrack) {
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
        if (IsGlyphMark(this.track.mark)) {
            this.track.mark.elements = deepToLongElements(this.track.mark.elements);
        }
        // TODO: Add binds for not-specified channels.

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
        const data = this.track.data as any; //as Datum[];

        if (IsGlyphMark(this.track.mark)) {
            const { requiredChannels: required } = this.track.mark;

            // Add channel-to-domain mappings when `field` suggested.
            required.forEach((c: any) => {
                // as GenericType<Channel>
                const channel = (this.track as any)[c];
                if (IsChannelDeep(channel)) {
                    const { field } = channel;

                    if (!field) return;

                    this.channelToField[c] = field;

                    // Domains for x1 and y1 needs to be added to that of x and y, respectively.
                    const targetChannel = c === 'xe' ? 'x' : c === 'ye' ? 'y' : c;

                    if (!this.domains[targetChannel]) {
                        this.domains[targetChannel] = [];
                    }
                    this.domains[targetChannel] = [
                        ...this.domains[targetChannel],
                        ...(channel.domain && IsDomainFlat(channel.domain)
                            ? channel.domain
                            : data.map((d: any) => d[field]))
                    ];
                }
            });
            Object.keys(this.domains).forEach(c => {
                const channel = (this.track as any)[c];
                if (IsChannelDeep(channel)) {
                    const { type } = channel;
                    this.domains[c] =
                        type === 'nominal'
                            ? d3.set(this.domains[c]).values()
                            : (d3.extent(this.domains[c].map(d => +d)) as [number, number]);
                }
            });
        }
    }

    private setRanges(bb: BoundingBox) {
        Object.keys(this.domains).forEach(c => {
            const channel = (this.track as any)[c];
            if (IsChannelDeep(channel)) {
                if (c === 'x') {
                    this.ranges['x'] = [bb.x, bb.x + bb.width];
                } else if (c === 'y') {
                    this.ranges['y'] = [bb.y, bb.y + bb.height];
                } else if (c === 'color') {
                    this.ranges['color'] = channel.range ? channel.range : (d3.schemeTableau10 as string[]);
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
            const channel = (this.track as any)[c];
            if (IsChannelDeep(channel)) {
                const { type } = channel;
                if (this.ranges[c]) {
                    // TODO: Simplify the below
                    this.scales[c] =
                        c === 'color' && type === 'nominal'
                            ? d3
                                  .scaleOrdinal()
                                  .domain(this.domains[c] as string[])
                                  .range(this.ranges[c] as string[]) // was without string[]
                            : c === 'color' && type === 'quantitative'
                            ? d3.scaleSequential(d3.interpolateBrBG).domain(this.domains[c] as [number, number])
                            : type === 'nominal'
                            ? d3
                                  .scaleOrdinal()
                                  .domain(this.domains[c] as string[])
                                  .range(this.ranges[c] as string[]) // was without string[]
                            : d3
                                  .scaleLinear()
                                  .domain(this.domains[c] as [number, number])
                                  .range(this.ranges[c] as [number, number]);
                }
            }
        });
    }

    public getEncoding(
        element: GlyphElement /* TODO: Remove this */,
        c: keyof typeof ChannelTypes,
        datum: Datum
        // mark?: MarkType
    ): any {
        // TODO: Move out
        const DEFAULT_ENCODING: { [k: string]: number | string } = {
            opacity: 1,
            size: 10,
            color: 'black',
            text: ''
        };
        ////

        const scaleChannel = c === 'xe' ? 'x' : c === 'ye' ? 'y' : c;

        if (IsChannelValue(element[c])) {
            switch (c) {
                case 'size':
                case 'opacity':
                case 'color':
                case 'text':
                    return (element[c] as any).value;
            }
        } else if (IsChannelValue(this.track[c])) {
            switch (c) {
                case 'size':
                case 'opacity':
                case 'color':
                case 'text':
                    return (this.track[c] as any).value;
            }
        } else if (this.scales[scaleChannel]) {
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
        // else if (/*c === 'w' */ false) {
        //     if (
        //         this.scales['x'] &&
        //         IsChannelDeep(this.track.x) &&
        //         IsChannelDeep(this.track.xe) &&
        //         element.x !== 'none' &&
        //         element.xe !== 'none'
        //     ) {
        //         const altSize = Math.abs(
        //             (datum[this.getFieldByChannel('xe')] as number) - (datum[this.getFieldByChannel('x')] as number)
        //         );
        //         return this.scales['x'](altSize);
        //     } else {
        //         return this.getEncoding(element, 'size', datum);
        //     }
        // }
        else {
            // If not specified, use default value.
            return DEFAULT_ENCODING[c];
        }
    }

    public getScale(c: ChannelType | string) {
        return this.scales[c];
    }
}
