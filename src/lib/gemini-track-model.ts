import {
    IsChannelDeep,
    ChannelDeep,
    PREDEFINED_COLORS,
    ChannelTypes,
    IsChannelValue,
    IsStackedChannel,
    ChannelValue,
    BasicSingleTrack,
    SingleTrack
} from './gemini.schema';
import merge from 'lodash/merge';
import * as d3 from 'd3';
import { group } from 'd3-array';
import {
    validateTrack,
    getGenomicChannelFromTrack,
    getGenomicChannelKeyFromTrack
} from '../higlass-gemini-track/validate';
import { HIGLASS_AXIS_SIZE } from './higlass/higlass-model';
import { SUPPORTED_CHANNELS } from '../higlass-gemini-track/mark';

const TRACK_ROW_PADDING = 3;

export class GeminiTrackModel {
    /* spec */
    private specOriginal: BasicSingleTrack; // original spec of users
    private specComplete: BasicSingleTrack; // processed spec used in visualizations
    private specCompleteAlt: BasicSingleTrack; // processed spec used when zoomed out // TODO: remove this and have only one track?

    /* whether to use alternative spec */
    private _isAlt: boolean; // we could ultimately remove this

    /* data */
    private _data: { [k: string]: number | string }[];

    /* channel scales */
    private channelScales: {
        [channel: string]:
            | d3.ScaleLinear<any, any>
            | d3.ScaleOrdinal<any, any>
            | d3.ScaleBand<any>
            | d3.ScaleSequential<any>
            | (() => string | number); // constant value
    };

    // TODO: make mark-specific default
    private DEFAULTS = {
        NOMINAL_COLOR: d3.schemeCategory10,
        QUANTITATIVE_COLOR: 'viridis',
        SIZE: 3
    };

    constructor(track: SingleTrack, data: { [k: string]: number | string }[], isAlt: boolean) {
        this.specOriginal = JSON.parse(JSON.stringify(track));
        this._data = JSON.parse(JSON.stringify(data));

        this.specComplete = JSON.parse(JSON.stringify(track));
        this.specCompleteAlt = JSON.parse(JSON.stringify(track));
        this._isAlt = isAlt;

        this.channelScales = {};

        const validity = this.validateSpec();
        if (!validity.valid) {
            console.warn('Gemini specification is not valid!', validity.errorMessages);
            return;
        }

        if (this.specComplete?.zoomAction?.type === 'alternative-encoding') {
            // override the original spec for using alternative encoding
            this.specCompleteAlt = merge(
                JSON.parse(JSON.stringify(this.specComplete)),
                this.specComplete.zoomAction.spec
            );
        }

        // fill missing options
        this._generateToCompleteSpec(this.specComplete);
        this._generateToCompleteSpec(this.specCompleteAlt);

        this.setChannelScalesBasedOnCompleteSpec();

        // Add default specs.
        // ...
    }

    public originalSpec(): BasicSingleTrack {
        return this.specOriginal;
    }

    public spec(): BasicSingleTrack {
        return this._isAlt ? this.specCompleteAlt : this.specComplete;
    }

    public data(): { [k: string]: number | string }[] {
        return this._data;
    }

    /**
     * Fill the missing options with default values or values calculated based on the data.
     */
    private _generateToCompleteSpec(track: BasicSingleTrack) {
        if (!track.width) {
            track.width = 300;
        }
        if (!track.height) {
            track.height = 300;
        }

        // TODO: better way to deal with axis?
        const xOrY = this.getGenomicChannelKey();
        let isAxisShown = false;
        if (xOrY === 'x') {
            isAxisShown =
                (IsChannelDeep(track.x1) && (track.x1.axis as boolean)) ||
                (IsChannelDeep(track.x) && (track.x.axis as boolean));
        }
        if (xOrY === 'y') {
            isAxisShown =
                (IsChannelDeep(track.y1) && (track.y1.axis as boolean)) ||
                (IsChannelDeep(track.y) && (track.y.axis as boolean));
        }
        if (xOrY && isAxisShown) {
            const widthOrHeight = xOrY === 'x' ? 'height' : 'width';
            track[widthOrHeight] = ((track[widthOrHeight] as number) - HIGLASS_AXIS_SIZE) as number;
        }
        ///

        // add zeroBaseline
        SUPPORTED_CHANNELS.forEach(channelKey => {
            const channel = track[channelKey];
            if (IsChannelDeep(channel) && typeof channel.zeroBaseline === 'undefined') {
                channel.zeroBaseline = true;
            }
        });

        this.addChannelRangeDomainValue(track);

        // DEBUG
        // console.log('corrected track', track);
    }

    /**
     * Find an either `x` or `y` that is encoded with genomic coordinate and return 'x' or 'y'.
     * `undefined` if not found.
     */
    public getGenomicChannelKey(): 'x' | 'y' | undefined {
        return getGenomicChannelKeyFromTrack(this.spec());
    }
    /**
     * Find a genomic field from the track specification.
     * `undefined` if not found.
     */
    public getGenomicChannel(): ChannelDeep | undefined {
        return getGenomicChannelFromTrack(this.spec());
    }

    /**
     * Replace a domain with a new one in the complete spec(s) if the original spec does not define the domain.
     * A domain is replaced only when the channel is bound with data (i.e., `ChannelDeep`).
     */
    public setChannelDomain(channelKey: keyof typeof ChannelTypes, domain: string[] | number[], force?: boolean) {
        const channelRaw = this.originalSpec()[channelKey];
        if (!force && IsChannelDeep(channelRaw) && channelRaw.domain !== undefined) {
            // if domain is provided in the original spec, we do not replace the domain in the complete spec(s)
            return;
        }
        const channel = this.specComplete[channelKey];
        if (IsChannelDeep(channel)) {
            channel.domain = domain;
        }
        const channelAlt = this.specCompleteAlt[channelKey];
        if (IsChannelDeep(channelAlt)) {
            channelAlt.domain = domain;
        }
    }

    /**
     * Replace a domain with a new one in the complete spec(s).
     * A domain is replaced only when the channel is bound with data (i.e., `ChannelDeep`).
     */
    public setChannelRange(channelKey: keyof typeof ChannelTypes, range: string[] | number[]) {
        const channel = this.specComplete[channelKey];
        if (IsChannelDeep(channel)) {
            channel.range = range;
        }
        const channelAlt = this.specComplete[channelKey];
        if (IsChannelDeep(channelAlt)) {
            channelAlt.range = range;
        }
    }

    /**
     * With the scales already constructed, get the encoded value.
     */
    public encodedValue(channelKey: keyof typeof ChannelTypes, value?: number | string) {
        if (channelKey === 'text') return value;

        const channel = this.spec()[channelKey];
        const channelFieldType = IsChannelDeep(channel)
            ? channel.type
            : IsChannelValue(channel)
            ? 'constant'
            : undefined;

        // DEBUG
        // console.log(value, (this.channelScales[channelKey] as any).domain(), (this.channelScales[channelKey] as any).range(), (this.channelScales[channelKey] as any)(0));

        if (channelFieldType === 'constant') {
            return (this.channelScales[channelKey] as () => number | string)();
        }

        // the type of channel scale is determined by a { channel type, field type } pair
        switch (channelKey) {
            case 'color':
                if (channelFieldType === 'quantitative')
                    return (this.channelScales[channelKey] as d3.ScaleSequential<any>)(value as number);
                if (channelFieldType === 'nominal')
                    return (this.channelScales[channelKey] as d3.ScaleOrdinal<any, any>)(value as string);
                /* genomic is not supported */
                break;
            case 'x':
            case 'xe':
            case 'y':
                if (channelFieldType === 'quantitative' || channelFieldType === 'genomic')
                    return (this.channelScales[channelKey] as d3.ScaleLinear<any, any>)(value as number);
                if (channelFieldType === 'nominal')
                    return (this.channelScales[channelKey] as d3.ScaleBand<any>)(value as string);
                break;
            case 'size':
                if (channelFieldType === 'quantitative')
                    return (this.channelScales[channelKey] as d3.ScaleLinear<any, any>)(value as number);
                /* nominal is not supported */
                /* genomic is not supported */
                break;
            case 'row':
                /* quantitative is not supported */
                if (channelFieldType === 'nominal')
                    return (this.channelScales[channelKey] as d3.ScaleBand<any>)(value as string);
                /* genomic is not supported */
                break;
            default:
                console.warn(`${channelKey} is not supported yet for encoding values, so returning a undefined value`);
                return undefined;
        }
    }

    // TODO: better organize this, perhaps, by combining several if statements
    /**
     * Set missing `range`, `domain`, and/or `value` of each channel by looking into data.
     */
    public addChannelRangeDomainValue(spec: BasicSingleTrack) {
        const data = this.data();

        const genomicChannel = this.getGenomicChannel();
        if (!genomicChannel || !genomicChannel.field) {
            console.warn('Genomic field is not provided in the specification');
            return;
        }

        if (!spec.width || !spec.height) {
            console.warn('Track size is not determined yet');
            return;
        }

        const WARN_MSG = (c: string, t: string) =>
            `The channel key and type pair {${c}, ${t}} is not supported when generating channel scales`;

        SUPPORTED_CHANNELS.forEach(channelKey => {
            const channel = spec[channelKey];

            if (IsChannelDeep(channel) && channel.type === 'genomic') {
                // we use a scale of a `genomic` field that is generated by HiGlass
                return;
            }

            if (IsStackedChannel(spec, channelKey) && IsChannelDeep(channel)) {
                // we need to group data before calculating scales because marks are going to be stacked
                const pivotedData = group(data, d => d[genomicChannel.field as string]);
                const xKeys = [...pivotedData.keys()];

                if (!channel.domain) {
                    // TODO: consider data ranges in negative values
                    const min = channel.zeroBaseline
                        ? 0
                        : d3.min(
                              xKeys.map(d =>
                                  d3.sum(
                                      (pivotedData.get(d) as any).map((_d: any) =>
                                          channel.field ? _d[channel.field] : undefined
                                      )
                                  )
                              ) as number[]
                          );
                    const max = d3.max(
                        xKeys.map(d =>
                            d3.sum(
                                (pivotedData.get(d) as any).map((_d: any) =>
                                    channel.field ? _d[channel.field] : undefined
                                )
                            )
                        ) as number[]
                    );
                    channel.domain = [min, max] as [number, number]; // TODO: what if data ranges in negative values
                }

                if (!channel.range) {
                    const rowChannel = spec.row;
                    const rowField = IsChannelDeep(rowChannel) ? rowChannel.field : undefined;
                    const rowCategories = rowField ? Array.from(new Set(data.map(d => d[rowField as string]))) : [1];
                    const rowHeight = (spec.height as number) / rowCategories.length;

                    // `channel` here is either `x` or `y` because they only can ba stacked
                    switch (channelKey) {
                        case 'x':
                            channel.range = [0, spec.width] as [number, number]; // TODO: not considering vertical direction tracks
                            break;
                        case 'y':
                            channel.range = [0, rowHeight];
                            break;
                    }
                }
            } else {
                const rowChannel = spec.row;
                const rowField = IsChannelDeep(rowChannel) ? rowChannel.field : undefined;
                const rowCategories = rowField ? Array.from(new Set(data.map(d => d[rowField as string]))) : [1];
                const rowHeight = (spec.height as number) / rowCategories.length;

                if (!channel) {
                    // this means the channel is entirely missing in the specification, so we add a default value
                    let value;
                    switch (channelKey) {
                        case 'x':
                            value = (spec.width as number) / 2.0;
                            break;
                        case 'y':
                            value = rowHeight / 2.0;
                            break;
                        case 'size':
                            if (spec.mark === 'line') value = 1;
                            else value = this.DEFAULTS.SIZE;
                            break;
                        case 'color':
                            value = this.DEFAULTS.NOMINAL_COLOR[0];
                            break;
                        case 'row':
                            value = 0;
                            break;
                        case 'stroke':
                            value = 'black';
                            break;
                        case 'strokeWidth':
                            value = 0;
                            break;
                        case 'opacity':
                            value = 1;
                            break;
                        default:
                            console.warn(WARN_MSG(channelKey, 'value'));
                    }
                    if (typeof value !== 'undefined') {
                        spec[channelKey] = { value } as ChannelValue;
                    }
                } else if (IsChannelDeep(channel) && channel.type === 'quantitative') {
                    if (!channel.domain) {
                        const min = channel.zeroBaseline
                            ? 0
                            : (d3.min(data.map(d => d[channel.field as string]) as number[]) as number);
                        const max = d3.max(data.map(d => d[channel.field as string]) as number[]) as number;
                        channel.domain = [min, max]; // TODO: what if data ranges in negative values
                    }

                    if (!channel.range) {
                        let range;
                        switch (channelKey) {
                            case 'x':
                            case 'xe':
                                range = [0, spec.width];
                                break;
                            case 'y':
                                range = [0 + TRACK_ROW_PADDING, rowHeight - TRACK_ROW_PADDING];
                                break;
                            case 'color':
                                range = this.DEFAULTS.QUANTITATIVE_COLOR as PREDEFINED_COLORS;
                                break;
                            case 'size':
                                range = [2, 6];
                                break;
                            default:
                                console.warn(WARN_MSG(channelKey, channel.type));
                        }
                        if (range) {
                            channel.range = range as PREDEFINED_COLORS | number[];
                        }
                    }
                } else if (IsChannelDeep(channel) && channel.type === 'nominal') {
                    if (!channel.domain) {
                        channel.domain = Array.from(new Set(data.map(d => d[channel.field as string]))) as string[];
                    }
                    if (!channel.range) {
                        let range;
                        switch (channelKey) {
                            case 'x':
                            case 'xe':
                                range = [0, spec.width];
                                break;
                            case 'y':
                                range = [0 + TRACK_ROW_PADDING, rowHeight - TRACK_ROW_PADDING];
                                break;
                            case 'color':
                                range = this.DEFAULTS.NOMINAL_COLOR;
                                break;
                            case 'row':
                                range = [0, spec.height];
                                break;
                            default:
                                console.warn(WARN_MSG(channelKey, channel.type));
                        }
                        if (range) {
                            channel.range = range as number[] | string[];
                        }
                    }
                }
            }
        });
    }

    /**
     * Store the scale of individual visual channels based on the `complete` spec.
     */
    public setChannelScalesBasedOnCompleteSpec() {
        const spec = this.spec();

        SUPPORTED_CHANNELS.forEach(channelKey => {
            const channel = spec[channelKey];

            if (IsChannelDeep(channel) && channel.type === 'genomic') {
                // genomicScale is generated by HiGlass and we need to use it instead // TODO:
                return;
            }

            if (IsChannelValue(channel)) {
                this.channelScales[channelKey] = () => channel.value;
            } else if (IsChannelDeep(channel)) {
                const domain = channel.domain;
                const range = channel.range;

                if (channel.type === 'quantitative') {
                    switch (channelKey) {
                        case 'x':
                        case 'xe':
                        case 'y':
                        case 'size':
                            this.channelScales[channelKey] = d3
                                .scaleLinear()
                                .domain(domain as [number, number])
                                .range(range as [number, number]);
                            break;
                        case 'color':
                            this.channelScales[channelKey] = d3
                                .scaleSequential(d3.interpolateViridis /* TODO */)
                                .domain(domain as [number, number]);
                            break;
                        default:
                            console.warn('Not supported channel for calculating scales');
                    }
                } else if (channel.type === 'nominal') {
                    switch (channelKey) {
                        case 'x':
                        case 'xe':
                        case 'y':
                        case 'row':
                            this.channelScales[channelKey] = d3
                                .scaleBand()
                                .domain(domain as string[])
                                .range(range as [number, number]);
                            break;
                        case 'color':
                            this.channelScales[channelKey] = d3
                                .scaleOrdinal(range as string[])
                                .domain(domain as string[]);
                            break;
                        default:
                            console.warn('Not supported channel for calculating scales');
                    }
                }
            }
        });
    }

    // TODO: better performance?
    /**
     * Update `x` or `y` scale reflecting the size changes.
     */
    // public setXOrYScale(xOrY: 'x' | 'y', widthOrHeight: number) {
    // update `width` or `height` in the spec
    // this.specOriginal[xOrY === 'x' ? 'width' : 'height'] = widthOrHeight;
    // this.specComplete[xOrY === 'x' ? 'width' : 'height'] = widthOrHeight;
    // this.specCompleteAlt[xOrY === 'x' ? 'width' : 'height'] = widthOrHeight;
    // update `range` in the spec
    // update scales with the new `range`
    // }

    /**
     * Return the scale of a visual channel.
     * `undefined` if we do not have the scale.
     */
    public getChannelScale(channelKey: keyof typeof ChannelTypes) {
        return this.channelScales[channelKey];
    }

    /**
     * Validate the original spec.
     */
    public validateSpec(): { valid: boolean; errorMessages: string[] } {
        return validateTrack(this.originalSpec());
    }
}
