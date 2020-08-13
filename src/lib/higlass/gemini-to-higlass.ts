import Ajv from 'ajv'
import HiGlassSchema from "./higlass.schema.json"
import { HiGlassSpec, EnumTrackType } from "./higlass.schema"
import { HiGlassModel } from './higlass-model'
import { parseServerAndTilesetUidFromUrl, validTilesetUrl } from '../utils'
import { GenericType, Track, Channel, IsDataDeep, IsHiGlassTrack, IsChannelDeep, IsShallowMark, IsMarkDeep, Domain, Range } from '../gemini.schema'
import { BoundingBox } from '../utils/bounding-box'
import { COLOR_SCHEME_VIRIDIS } from '../utils/contants'

export function compiler(track: Track | GenericType<Channel>, bb: BoundingBox): HiGlassSpec {

    const higlass = new HiGlassModel()

    if (IsHiGlassTrack(track) && IsDataDeep(track.data)) {
        const { server, tilesetUid } = parseServerAndTilesetUidFromUrl(track.data.url)

        // Mose this to an independent file
        const defaultZoomTech = {
            type: 'none'
        }

        // Is this track horizontal or vertical?
        const isXGenomic = IsChannelDeep(track.x) && track.x.type === "genomic"
        const isYGenomic = IsChannelDeep(track.y) && track.y.type === "genomic"
        const xDomain = isXGenomic && IsChannelDeep(track.x) ? track.x.domain as Domain : undefined
        const yDomain = isYGenomic && IsChannelDeep(track.y) ? track.y.domain as Domain : undefined
        const colorRange = IsChannelDeep(track.color) ? track.color.range as Range : undefined
        const trackDirection = isXGenomic && isYGenomic ? 'both' : isXGenomic ? 'horizontal' : 'vertical'
        const trackType = IsShallowMark(track.mark) ? track.mark : IsMarkDeep(track.mark) ? track.mark.type : 'unknown'
        const zoomOutTechnique = track.zoomOutTechnique ?? defaultZoomTech

        higlass.setDomain(xDomain, yDomain)

        // TODO: remove below
        const typeMap: { [k: string]: EnumTrackType } = {
            // gemini track types
            'gemini-track-higlass': 'gemini-track',
            'point': 'gemini-track',
            'bar': 'gemini-track',
            'line': 'gemini-track',
            'rect': 'gemini-track',

            // higlass track types
            'gene-annotation-higlass': `${trackDirection}-gene-annotations`,
            'point-higlass': `${trackDirection}-point`,
            'bar-higlass': `${trackDirection}-bar`,
            'line-higlass': `${trackDirection}-line`,
            '1d-heatmap-higlass': `${trackDirection}-1d-heatmap`,
            // ...
        } as { [k: string]: EnumTrackType }

        const defaultOptions: { [k: string]: Object } = {
            'point-higlass': {
                pointColor: '#0072B2',
                labelPosition: 'hidden',
                axisPositionHorizontal: 'left'
            },
            'bar-higlass': {
                barFillColor: '#0072B2',
                labelPosition: 'hidden',
                axisPositionHorizontal: 'left'
            },
            'line-higlass': {
                lineStrokeColor: '#0072B2',
                labelPosition: 'hidden',
                axisPositionHorizontal: 'left'
            },
            '1d-heatmap-higlass': {
                colorRange: COLOR_SCHEME_VIRIDIS,
                labelPosition: 'hidden'
            },
        }
        const higlassTrackType = typeMap[trackType]
        if (!higlassTrackType) return {}

        higlass.setMainTrack({
            type: higlassTrackType,
            server: server,
            tilesetUid: tilesetUid,
            width: bb.width,
            height: bb.height, // TODO: consider the height of axes
            options: {
                ...defaultOptions[trackType],
                colorScale: colorRange,
                spec: { ...track, data: undefined }
            }
        }).addTrackSourceServers(server)

        const chanToPos: { [k: string]: 'left' | 'right' | 'top' | 'bottom' } = {
            x: 'bottom',
            x1: 'top',
            y: 'left',
            y1: 'right'
        }
        Object.keys(chanToPos).forEach(c => {
            const channelDef = (track as GenericType<Channel>)[c]
            if (IsChannelDeep(channelDef) && channelDef.axis) {
                higlass.setAxisTrack(chanToPos[c])
            }
        })

        higlass.validateSpec()

        console.log('HiGlass viewConfig:', higlass.spec())

        return higlass.spec()
    }
    return {}
}

export function validateHG(hg: HiGlassSpec): boolean {

    const validate = new Ajv({ extendRefs: true }).compile(HiGlassSchema)
    const valid = validate(hg)

    if (validate.errors) {
        console.warn(JSON.stringify(validate.errors, null, 2))
    }

    // TODO: Check types such as default values and locationLocks

    return valid as boolean
} 