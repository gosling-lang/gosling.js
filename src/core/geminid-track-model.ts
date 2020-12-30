import {
    ChannelDeep,
    PREDEFINED_COLORS,
    ChannelTypes,
    ChannelValue,
    BasicSingleTrack,
    SingleTrack,
    Channel
} from './geminid.schema';
import { validateTrack, getGenomicChannelFromTrack, getGenomicChannelKeyFromTrack } from './utils/validate';
import * as d3 from 'd3';
import { group } from 'd3-array';
import { HIGLASS_AXIS_SIZE } from './higlass-model';
import { SUPPORTED_CHANNELS } from './mark';
import { PIXIVisualProperty } from './visual-property.schema';
import { rectProperty } from './mark/rect';
import { pointProperty } from './mark/point';
import { barProperty } from './mark/bar';
import { getNumericDomain } from './utils/scales';
import { logicalComparison } from './utils/semantic-zoom';
import { aggregateData } from './utils/data-transform';
import {
    IsChannelDeep,
    IsChannelValue,
    getValueUsingChannel,
    IsShallowMark,
    IsStackedChannel,
    IsDomainArray,
    PREDEFINED_COLOR_STR_MAP
} from './geminid.schema.guards';
import { CHANNEL_DEFAULTS } from './channel';

export type ScaleType =
    | d3.ScaleLinear<any, any>
    | d3.ScaleOrdinal<any, any>
    | d3.ScaleBand<any>
    | d3.ScaleSequential<any>
    | (() => string | number); // constant value

export class GeminidTrackModel {
    /* spec */
    private specOriginal: BasicSingleTrack; // original spec of users
    private specComplete: BasicSingleTrack; // processed spec, being used in visualizations

    /* high-level configuration */
    private isCircular: boolean;

    /* data */
    private dataOriginal: { [k: string]: number | string }[];
    private dataAggregated: { [k: string]: number | string }[];

    /* channel scales */
    private channelScales: {
        [channel: string]: ScaleType;
    };

    constructor(spec: SingleTrack, data: { [k: string]: number | string }[], isCircular?: boolean) {
        this.dataOriginal = JSON.parse(JSON.stringify(data));
        this.dataAggregated = JSON.parse(JSON.stringify(data));

        this.specOriginal = JSON.parse(JSON.stringify(spec));
        this.specComplete = JSON.parse(JSON.stringify(spec));

        // EXPERIMENTAL
        this.isCircular = !!isCircular || this.specOriginal.layout === 'circular';

        this.channelScales = {};

        const validity = this.validateSpec();
        if (!validity.valid) {
            console.warn('Gemini specification is not valid!', validity.errorMessages);
            return;
        }

        // fill missing options
        this.generateCompleteSpec(this.specComplete);

        this.flipRanges(this.specComplete);

        // generate scales based on domains and ranges
        this.generateScales();

        // EXPERIMENTAL: aggregate data when `aggregate` option is used
        this.dataAggregated = aggregateData(this.spec(), this.dataAggregated);

        // Add default specs.
        // ...

        // DEBUG
        // console.log('corrected track', this.spec());
    }

    public originalSpec(): BasicSingleTrack {
        return this.specOriginal;
    }

    public spec(): BasicSingleTrack {
        return this.specComplete;
    }

    public circular(): boolean {
        return this.isCircular;
    }

    public data(): { [k: string]: number | string }[] {
        return this.dataAggregated;
    }

    /**
     * Fill the missing options with default values or with the values calculated based on the data.
     */
    private generateCompleteSpec(spec: BasicSingleTrack) {
        if (!spec.width) {
            spec.width = 300;
        }
        if (!spec.height) {
            spec.height = 300;
        }
        if (!spec.outerRadius) {
            spec.outerRadius = Math.min(spec.width, spec.height) / 2.0;
        }
        if (!spec.innerRadius) {
            spec.innerRadius = Math.max(spec.outerRadius - 80, 0);
        }

        // TODO: better way to deal with axis?
        const xOrY = this.getGenomicChannelKey();
        let isAxisShown = false;
        if (xOrY === 'x') {
            isAxisShown = IsChannelDeep(spec.x) && spec.x.axis !== undefined;
        }
        if (xOrY === 'y') {
            isAxisShown = IsChannelDeep(spec.y) && spec.y.axis !== undefined;
        }
        if (xOrY && isAxisShown) {
            const widthOrHeight = xOrY === 'x' ? 'height' : 'width';
            spec[widthOrHeight] = ((spec[widthOrHeight] as number) - HIGLASS_AXIS_SIZE) as number;
        }
        ///

        // zero baseline
        SUPPORTED_CHANNELS.forEach(channelKey => {
            const channel = spec[channelKey];
            if (
                IsChannelDeep(channel) &&
                typeof channel.zeroBaseline === 'undefined' &&
                channel.type !== 'genomic' &&
                ['x', 'y'].includes(channelKey)
            ) {
                channel.zeroBaseline = true;
            }
        });

        this.addScaleMaterials(spec);
    }

    /**
     * TODO: This is experimental. For bar charts, for example, additional care should be taken to correctly flip the visual marks.
     * Flip the x or y scales when `flip` options are used.
     */
    private flipRanges(spec: BasicSingleTrack) {
        if (IsChannelDeep(spec.x) && spec.x.flip && Array.isArray(spec.x.range)) {
            spec.x.range = spec.x.range.reverse();
        }
        if (IsChannelDeep(spec.y) && spec.y.flip && Array.isArray(spec.y.range)) {
            spec.y.range = spec.y.range.reverse();
        }
    }

    /**
     * Find an axis channel that is encoded with genomic coordinate and return the key (e.g., 'x').
     * `undefined` if not found.
     */
    public getGenomicChannelKey(): 'x' | 'xe' | 'y' | 'ye' | 'x1' | 'x1e' | 'y1' | 'y1e' | undefined {
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
    }

    /**
     * Get the encoded value using the scales already constructed.
     */
    public encodedValue(channelKey: keyof typeof ChannelTypes, value?: number | string) {
        if (channelKey === 'text' && value !== undefined) {
            return `${+value ? ~~value : value}`;
            // TODO: Better formatting?
            // return `${+value ? (+value - ~~value) > 0 ? (+value).toExponential(1) : ~~value : value}`;
        }

        const channel = this.spec()[channelKey];
        const channelFieldType = IsChannelDeep(channel)
            ? channel.type
            : IsChannelValue(channel)
            ? 'constant'
            : undefined;

        if (!channelFieldType) {
            // Shouldn't be reached. Channel should be either encoded with data or a constant value.
            return undefined;
        }

        if (channelFieldType === 'constant') {
            // Just return the constant value.
            return (this.channelScales[channelKey] as () => number | string)();
        }

        if (value === undefined) {
            // Value is undefined, so returning undefined.
            return undefined;
        }

        // The type of a channel scale is determined by a { channel type, field type } pair
        switch (channelKey) {
            case 'x':
            case 'y':
            case 'x1':
            case 'y1':
            case 'xe':
            case 'ye':
                if (channelFieldType === 'quantitative' || channelFieldType === 'genomic') {
                    return (this.channelScales[channelKey] as d3.ScaleLinear<any, any>)(value as number);
                }
                if (channelFieldType === 'nominal') {
                    return (this.channelScales[channelKey] as d3.ScaleBand<any>)(value as string);
                }
                break;
            case 'color':
            case 'stroke':
                if (channelFieldType === 'quantitative') {
                    return (this.channelScales[channelKey] as d3.ScaleSequential<any>)(value as number);
                }
                if (channelFieldType === 'nominal') {
                    return (this.channelScales[channelKey] as d3.ScaleOrdinal<any, any>)(value as string);
                }
                /* genomic is not supported */
                break;
            case 'size':
                if (channelFieldType === 'quantitative') {
                    return (this.channelScales[channelKey] as d3.ScaleLinear<any, any>)(value as number);
                }
                if (channelFieldType === 'nominal') {
                    return (this.channelScales[channelKey] as d3.ScaleOrdinal<any, any>)(value as string);
                }
                /* genomic is not supported */
                break;
            case 'row':
                /* quantitative is not supported */
                if (channelFieldType === 'nominal') {
                    return (this.channelScales[channelKey] as d3.ScaleBand<any>)(value as string);
                }
                /* genomic is not supported */
                break;
            case 'strokeWidth':
            case 'opacity':
                if (channelFieldType === 'quantitative') {
                    return (this.channelScales[channelKey] as d3.ScaleLinear<any, any>)(value as number);
                }
                /* nominal is not supported */
                /* genomic is not supported */
                break;
            default:
                console.warn(`${channelKey} is not supported for encoding values, so returning a undefined value`);
                return undefined;
        }
    }

    public trackVisibility(currentStage: { zoomLevel?: number }): boolean {
        const spec = this.spec();
        if (spec.visibility === undefined || spec.visibility.target !== 'track') {
            // if condition is not defined, just show them.
            return true;
        }

        const { operation, condition } = spec.visibility;
        if (condition.zoomLevel && currentStage.zoomLevel) {
            return logicalComparison(currentStage.zoomLevel, operation, condition.zoomLevel) === 1;
        } else if (condition.height && spec.height) {
            return logicalComparison(spec.height, operation, condition.height) === 1;
        } else if (typeof condition.width === 'number' && spec.width) {
            return logicalComparison(spec.width, operation, condition.width) === 1;
        }
        return true;
    }

    /**
     * Check whether the visual mark should be visible or not.
     * Return 0 (invisible) only when the predefined condition is correct.
     */
    public markVisibility(datum: { [k: string]: string | number }, metrics?: any): number {
        const spec = this.spec();
        if (spec.visibility === undefined || spec.visibility.target !== 'mark') {
            // if condition is not defined, just show them.
            return 1;
        }

        const vSpec = spec.visibility;
        const mark = spec.mark;
        switch (mark) {
            case 'text':
                if (vSpec.condition.width === '|xe-x|') {
                    // compare between the actual width and the |xe-x|
                    const xe = this.encodedPIXIProperty('xe', datum);
                    const x = this.encodedPIXIProperty('x', datum);
                    const padding = vSpec.condition.conditionPadding ?? 0;
                    if (xe === undefined || !metrics?.width) {
                        // we do not have xe to compare, so just make the marks visible
                        return 1;
                    }
                    return logicalComparison(
                        metrics.width + padding,
                        vSpec.operation,
                        Math.abs(xe - x),
                        vSpec.condition.transitionPadding
                    );
                }
                return 1;
            default:
                if (typeof vSpec.condition.width === 'number') {
                    // compare between the actual width and the constant width that user specified
                    const padding = vSpec.condition.conditionPadding ?? 0;
                    if (!metrics?.width) {
                        // we do not have xe to compare, so just make the marks visible
                        return 1;
                    }
                    return logicalComparison(
                        metrics.width + padding,
                        vSpec.operation,
                        vSpec.condition.width,
                        vSpec.condition.transitionPadding
                    );
                }
                return 1;
        }
    }

    /**
     *
     */
    public visualPropertyByChannel(channelKey: keyof typeof ChannelTypes, datum?: { [k: string]: string | number }) {
        const value = datum !== undefined ? getValueUsingChannel(datum, this.spec()[channelKey] as Channel) : undefined; // Is this safe enough?
        return this.encodedValue(channelKey, value);
    }

    /**
     * Retrieve an encoded visual property of a visual mark.
     */
    public encodedPIXIProperty(
        propertyKey: PIXIVisualProperty,
        datum?: { [k: string]: string | number },
        additionalInfo?: any
    ) {
        const mark = this.spec().mark;

        if (!IsShallowMark(mark)) {
            // we do not consider deep marks, yet
            return undefined;
        }

        // common visual properties, not specific to visual marks
        if (['text', 'color', 'stroke', 'opacity', 'strokeWidth', 'x', 'y', 'x1', 'xe', 'size'].includes(propertyKey)) {
            return this.visualPropertyByChannel(propertyKey as any, datum);
        }

        switch (mark) {
            case 'bar':
                return barProperty(this, propertyKey, datum, additionalInfo);
            case 'point':
            case 'text':
                return pointProperty(this, propertyKey, datum);
            case 'rect':
                return rectProperty(this, propertyKey, datum, additionalInfo);
            default:
                // Mark type that is not supported yet
                return undefined;
        }
    }

    // TODO: better organize this, perhaps, by combining several if statements
    /**
     * Set missing `range`, `domain`, and/or `value` of each channel by looking into data.
     */
    public addScaleMaterials(spec: BasicSingleTrack) {
        const data = this.data();

        const genomicChannel = this.getGenomicChannel();
        if (!genomicChannel || !genomicChannel.field) {
            console.warn('Genomic field is not provided in the specification');
            // EXPERIMENTAL: we are removing this rule in our spec.
            return;
        }

        if (!spec.width || !spec.height) {
            console.warn('Track size is not determined yet');
            return;
        }

        // const WARN_MSG = (c: string, t: string) =>
        //     `The channel key and type pair {${c}, ${t}} is not supported when generating channel scales`;

        SUPPORTED_CHANNELS.forEach(channelKey => {
            const channel = spec[channelKey];

            if (IsStackedChannel(spec, channelKey) && IsChannelDeep(channel)) {
                // we need to group data before calculating scales because marks are going to be stacked
                // (spec as any /* TODO: select more accurately */).x
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
                    const rowCategories =
                        this.getChannelDomainArray('row') ??
                        (rowField ? Array.from(new Set(data.map(d => d[rowField as string]))) : [1]);
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
                const rowCategories =
                    this.getChannelDomainArray('row') ??
                    (rowField ? Array.from(new Set(data.map(d => d[rowField as string]))) : [1]);
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
                            // TODO: make as an object
                            if (spec.mark === 'line') value = 1;
                            else if (spec.mark === 'bar') value = undefined;
                            else if (spec.mark === 'rect') value = undefined;
                            else if (spec.mark === 'triangle-r') value = undefined;
                            else if (spec.mark === 'triangle-l') value = undefined;
                            else if (spec.mark === 'triangle-d') value = undefined;
                            // Points in this case are stretched from `x` to `xe`
                            else if (
                                spec.stretch &&
                                spec.mark === 'point' &&
                                IsChannelDeep(spec.x) &&
                                IsChannelDeep(spec.xe)
                            )
                                value = undefined;
                            else value = CHANNEL_DEFAULTS.SIZE;
                            break;
                        case 'color':
                            value = CHANNEL_DEFAULTS.NOMINAL_COLOR[0];
                            break;
                        case 'row':
                            value = 0;
                            break;
                        case 'stroke':
                            value = 'black';
                            break;
                        case 'strokeWidth':
                            if (spec.mark === 'rule') value = 1;
                            else if (spec.mark === 'link') value = 1;
                            else value = 0;
                            break;
                        case 'opacity':
                            value = 1;
                            break;
                        case 'text':
                            value = '';
                            break;
                        default:
                        // console.warn(WARN_MSG(channelKey, 'value'));
                    }
                    if (typeof value !== 'undefined') {
                        spec[channelKey] = { value } as ChannelValue;
                    }
                } else if (IsChannelDeep(channel) && (channel.type === 'quantitative' || channel.type === 'genomic')) {
                    if (channel.domain === undefined) {
                        const min = channel.zeroBaseline
                            ? 0
                            : (d3.min(data.map(d => d[channel.field as string]) as number[]) as number) ?? 0;
                        const max = (d3.max(data.map(d => d[channel.field as string]) as number[]) as number) ?? 0;
                        channel.domain = [min, max]; // TODO: what if data ranges in negative values
                    } else if (channel.type === 'genomic' && !IsDomainArray(channel.domain)) {
                        channel.domain = getNumericDomain(channel.domain);
                    }

                    if (!channel.range) {
                        let range;
                        switch (channelKey) {
                            case 'x':
                            case 'xe':
                            case 'x1':
                                range = [0, spec.width];
                                break;
                            case 'y':
                                range = [0, rowHeight];
                                break;
                            case 'color':
                            case 'stroke':
                                range = CHANNEL_DEFAULTS.QUANTITATIVE_COLOR as PREDEFINED_COLORS;
                                break;
                            case 'size':
                                range = CHANNEL_DEFAULTS.SIZE_RANGE;
                                break;
                            case 'strokeWidth':
                                range = [1, 3];
                                break;
                            case 'opacity':
                                range = [0, 1];
                                break;
                            default:
                                // console.warn(WARN_MSG(channelKey, channel.type));
                                break;
                        }
                        if (range) {
                            channel.range = range as PREDEFINED_COLORS | number[];
                        }
                    }
                } else if (IsChannelDeep(channel) && channel.type === 'nominal') {
                    if (channel.domain === undefined) {
                        channel.domain = Array.from(new Set(data.map(d => d[channel.field as string]))) as string[];
                    }
                    if (!channel.range) {
                        let startSize = 2;
                        let range;
                        switch (channelKey) {
                            case 'x':
                            case 'xe':
                                range = [0, spec.width];
                                break;
                            case 'y':
                                range = [rowHeight, 0]; // reversed because the origin is on the top
                                break;
                            case 'color':
                            case 'stroke':
                                range = CHANNEL_DEFAULTS.NOMINAL_COLOR;
                                break;
                            case 'row':
                                range = [0, spec.height];
                                break;
                            case 'size':
                                range = (channel.domain as number[]).map(() => startSize++);
                                break;
                            default:
                                // console.warn(WARN_MSG(channelKey, channel.type));
                                break;
                        }
                        if (range) {
                            channel.range = range as number[] | string[];
                        }
                    }
                }
            }
        });

        /* Merge domains of neighbor channels (e.g., x and xe) */
        [
            ['x', 'xe'],
            ['y', 'ye']
        ].forEach(pair => {
            const [k1, k2] = pair as [keyof typeof ChannelTypes, keyof typeof ChannelTypes];
            const c1 = spec[k1],
                c2 = spec[k2];
            if (
                IsChannelDeep(c1) &&
                IsChannelDeep(c2) &&
                c1.type === c2.type &&
                c1.domain &&
                c2.domain &&
                Array.isArray(c1.domain) &&
                Array.isArray(c2.domain)
            ) {
                if (c1.type === 'genomic' || c1.type === 'quantitative') {
                    const min = d3.min([c1.domain[0] as number, c2.domain[0] as number]) as number;
                    const max = d3.max([c1.domain[1] as number, c2.domain[1] as number]) as number;
                    c1.domain = c2.domain = [min, max];
                } else if (c1.type === 'nominal') {
                    const range = Array.from(new Set([...c1.domain, ...c2.domain])) as string[];
                    c1.range = c2.range = range;
                }
            }
        });
    }

    /**
     * Store the scale of individual visual channels based on the `complete` spec.
     */
    public generateScales() {
        const spec = this.spec();

        /// DEBUG
        // console.log(spec);
        //

        SUPPORTED_CHANNELS.forEach(channelKey => {
            if (channelKey === 'text') {
                return;
            }

            const channel = spec[channelKey];

            if (IsChannelValue(channel)) {
                this.channelScales[channelKey] = () => channel.value;
            } else if (IsChannelDeep(channel)) {
                const domain = channel.domain;
                const range = channel.range;

                if (channel.type === 'quantitative' || channel.type === 'genomic') {
                    switch (channelKey) {
                        case 'x':
                        case 'x1':
                        case 'xe':
                        case 'y':
                        case 'size':
                        case 'opacity':
                        case 'strokeWidth':
                            this.channelScales[channelKey] = d3
                                .scaleLinear()
                                .domain(domain as [number, number])
                                .range(range as [number, number]);
                            break;
                        case 'color':
                        case 'stroke':
                            let interpolate = d3.interpolateViridis;
                            if (Object.keys(PREDEFINED_COLOR_STR_MAP).includes(range as string)) {
                                interpolate = PREDEFINED_COLOR_STR_MAP[range as string];
                            }
                            this.channelScales[channelKey] = d3
                                .scaleSequential(interpolate)
                                .domain(domain as [number, number]);
                            break;
                        default:
                        // console.warn('Not supported channel for calculating scales');
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
                        case 'size':
                            this.channelScales[channelKey] = d3
                                .scaleOrdinal()
                                .domain(domain as string[])
                                .range(range as number[]);
                            break;
                        case 'color':
                        case 'stroke':
                            this.channelScales[channelKey] = d3
                                .scaleOrdinal(range as string[])
                                .domain(domain as string[]);
                            break;
                        default:
                        // console.warn('Not supported channel for calculating scales');
                    }
                }
            }
        });
    }

    /**
     * Return the scale of a visual channel.
     * `undefined` if we do not have the scale.
     */
    public getChannelScale(channelKey: keyof typeof ChannelTypes) {
        return this.channelScales[channelKey];
    }

    /**
     * Set a new scale for a certain channel.
     */
    public setChannelScale(channelKey: keyof typeof ChannelTypes, scale: ScaleType) {
        this.channelScales[channelKey] = scale;
    }

    public addDataRows(_: { [k: string]: number | string }[]) {
        this.dataAggregated = [...this.dataAggregated, ..._];
    }

    /**
     * Return the domain of a visual channel.
     * `undefined` if we do not have domain in array.
     */
    public getChannelDomainArray(channelKey: keyof typeof ChannelTypes): string[] | number[] | undefined {
        const c = this.spec()[channelKey];
        return IsChannelDeep(c) && IsDomainArray(c.domain) ? c.domain : undefined;
    }

    /**
     * Validate the original spec.
     */
    public validateSpec(): { valid: boolean; errorMessages: string[] } {
        return validateTrack(this.originalSpec());
    }
}
