import Ajv from 'ajv';
import HiGlassSchema from "./higlass.schema.json";
import { HiGlassSpec, EnumTrackType } from "./higlass.schema";
import { HiGlassModel } from './higlass-model';
import { parseServerAndTilesetUidFromUrl, validTilesetUrl } from '../utils';
import { GenericType, Track, Channel, IsDataDeep, IsHiGlassTrack, IsChannelDeep, IsShallowMark, IsMarkDeep } from '../gemini.schema';
import { BoundingBox } from '../utils/bounding-box';
import { COLOR_SCHEME_VIRIDIS } from '../utils/contants';

export function compiler(track: Track | GenericType<Channel>, bb: BoundingBox): HiGlassSpec {

    const higlass = new HiGlassModel();

    if (IsHiGlassTrack(track) && IsDataDeep(track.data)) {
        const { server, tilesetUid } = parseServerAndTilesetUidFromUrl(track.data.url);

        // Is this track horizontal or vertical?
        const isXGenomic = IsChannelDeep(track.x) && track.x.type === "genomic"
        const isYGenomic = IsChannelDeep(track.y) && track.y.type === "genomic"
        const xDomain = isXGenomic && IsChannelDeep(track.x) ? track.x.domain as [number, number] : undefined
        const yDomain = isYGenomic && IsChannelDeep(track.y) ? track.y.domain as [number, number] : undefined
        const trackDirection = isXGenomic && isYGenomic ? 'both' : isXGenomic ? 'horizontal' : 'vertical'
        const trackType = IsShallowMark(track.mark) ? track.mark : IsMarkDeep(track.mark) ? track.mark.type : 'unknown'

        higlass.setDomain(xDomain, yDomain);

        const typeMap: { [k: string]: EnumTrackType } = {
            // TODO: Add horizontal vs. vertical
            'gene-annotation-higlass': `${trackDirection}-gene-annotations`,
            'point': `${trackDirection}-point`,
            'bar': `${trackDirection}-bar`,
            'line': `${trackDirection}-line`,
            'rect': `${trackDirection}-1d-heatmap`,
            // ...
        } as { [k: string]: EnumTrackType }

        const defaultOptions: { [k: string]: Object } = {
            'point': {
                pointColor: '#0072B2',
                labelPosition: 'hidden',
                axisPositionHorizontal: 'left'
            },
            'bar': {
                barFillColor: '#0072B2',
                labelPosition: 'hidden',
                axisPositionHorizontal: 'left'
            },
            'line': {
                lineStrokeColor: '#0072B2',
                labelPosition: 'hidden',
                axisPositionHorizontal: 'left'
            },
            'rect': {
                colorRange: COLOR_SCHEME_VIRIDIS,
                labelPosition: 'hidden'
            }

        }
        const higlassTrackType = typeMap[trackType];
        if (!higlassTrackType) return {};

        higlass.setMainTrack({
            type: higlassTrackType,
            server: server,
            tilesetUid: tilesetUid,
            width: bb.width,
            height: bb.height, // TODO: consider the height of axes
            options: defaultOptions[trackType]
        }).addTrackSourceServers(server);

        const chanToPos: { [k: string]: 'left' | 'right' | 'top' | 'bottom' } = {
            x: 'bottom',
            x1: 'top',
            y: 'left',
            y1: 'right'
        }
        Object.keys(chanToPos).forEach(c => {
            const channelDef = (track as GenericType<Channel>)[c];
            if (IsChannelDeep(channelDef) && channelDef.axis) {
                higlass.setAxisTrack(chanToPos[c]);
            }
        })

        higlass.validateSpec();

        console.log('HiGlass viewConfig:', higlass.spec());

        return higlass.spec();
    }
    return {};
}

export function validateHG(hg: HiGlassSpec): boolean {

    const validate = new Ajv({ extendRefs: true }).compile(HiGlassSchema);
    const valid = validate(hg);

    if (validate.errors) {
        console.warn(JSON.stringify(validate.errors, null, 2));
    }

    // TODO: check types such as default values and locationLocks

    return valid as boolean;
} 