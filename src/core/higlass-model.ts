import uuid from 'uuid';
import { HiGlassSpec, Track } from './higlass.schema';
import HiGlassSchema from './higlass.schema.json';
import { Assembly, AxisPosition, Domain, Orientation } from './gosling.schema';
import { getNumericDomain } from './utils/scales';
import { RelativePosition } from './utils/bounding-box';
import { validateSpec } from './utils/validate';
import { GET_CHROM_SIZES } from './utils/assembly';

export const HIGLASS_AXIS_SIZE = 30;
const getViewTemplate = (assembly?: string) => {
    return {
        genomePositionSearchBoxVisible: false,
        layout: { w: 12, h: 12, x: 0, y: 0 },
        tracks: {
            top: [],
            left: [],
            center: [],
            right: [],
            bottom: [],
            gallery: [],
            whole: []
        },
        initialXDomain: [0, GET_CHROM_SIZES(assembly).total],
        initialYDomain: [0, GET_CHROM_SIZES(assembly).total],
        zoomFixed: false,
        zoomLimits: [1, null]
    };
};

/**
 * Model for managing the HiGlass view config.
 * We are currently only using a center track with additional tracks for axes in a single view.
 */
export class HiGlassModel {
    private assembly?: Assembly;
    private orientation?: Orientation;
    private hg: HiGlassSpec;
    constructor() {
        this.assembly = 'hg38';
        this.hg = {
            compactLayout: false,
            trackSourceServers: [],
            views: [],
            zoomLocks: {
                locksByViewUid: {},
                locksDict: {}
            },
            locationLocks: {
                locksByViewUid: {},
                locksDict: {}
            }
        };

        // Add default specs.
        this.setEditable(false);
    }

    public spec(): Readonly<HiGlassSpec> {
        return this.hg;
    }

    public setViewOrientation(orientation?: Orientation) {
        this.orientation = orientation;
        return this;
    }

    public addDefaultView(assembly?: string) {
        this.hg.views.push(JSON.parse(JSON.stringify({ ...getViewTemplate(assembly), uid: uuid.v1() })));
        return this;
    }

    public setAssembly(assembly?: Assembly) {
        this.assembly = assembly;
        this.setChromInfoPath(GET_CHROM_SIZES(this.assembly).path);
        return this;
    }

    public getAssembly() {
        return this.assembly;
    }

    public setTextTrack(
        width: number,
        height: number,
        text: string,
        textColor = 'black',
        fontSize = 14,
        fontWeight = 'normal'
    ) {
        if (this.getLastView()) {
            this.getLastView().tracks.top?.push({
                type: 'text',
                width,
                height,
                options: {
                    backgroundColor: 'white',
                    textColor,
                    fontSize,
                    fontWeight,
                    fontFamily: 'Arial',
                    offsetY: 0, // offset from the top of the track
                    align: 'left',
                    text
                }
            });
        }
        return this;
    }

    public addBrush(
        layout: 'circular' | 'linear',
        viewId: string,
        fromViewUid?: string,
        style?: {
            color?: string;
            stroke?: string;
            opacity?: string;
            strokeWidth?: number;
            startAngle?: number;
            endAngle?: number;
            innerRadius?: number;
            outerRadius?: number;
        }
    ) {
        if (!fromViewUid) return;

        // we could do this to either a `whole` track or a `center` track with `combined`
        (this.getView(viewId) as any)?.tracks.whole.push({
            // type: 'viewport-projection-center',
            type: layout === 'circular' ? 'brush-track' : 'viewport-projection-horizontal',
            uid: uuid.v4(),
            fromViewUid,
            options: {
                projectionFillColor: style?.color ?? '#777',
                projectionStrokeColor: style?.stroke ?? '#777',
                projectionFillOpacity: style?.opacity ?? 0.3,
                projectionStrokeOpacity: 0,
                strokeWidth: style?.strokeWidth ?? 1,
                startAngle: style?.startAngle,
                endAngle: style?.endAngle,
                innerRadius: style?.innerRadius,
                outerRadius: style?.outerRadius
            }
        });
        return this;
    }

    public getLastView() {
        return this.hg.views[this.hg.views.length - 1];
    }

    public getMainTrackPosition() {
        return this.orientation === 'vertical' ? 'right' : 'center';
    }

    /**
     * Get the last view that renders any visualization, so skiping empty tracks.
     */
    public getLastVisView() {
        const vs = this.hg.views.filter(v => (v.tracks as any)[this.getMainTrackPosition()]?.[0]?.type === 'combined');
        return vs[vs.length - 1];
    }

    public getView(viewId: string) {
        return this.hg.views.find(d => d.uid === viewId);
    }

    public validateSpec() {
        return validateSpec(HiGlassSchema, this.spec()).state === 'success';
    }

    public setDomain(xDomain: Domain | undefined, yDomain: Domain | undefined) {
        if (xDomain) {
            this.getLastView().initialXDomain = getNumericDomain(xDomain, this.getAssembly());
        }
        if (yDomain && this.orientation !== 'vertical') {
            this.getLastView().initialYDomain = getNumericDomain(yDomain, this.getAssembly()); // TODO:
        }
        return this;
    }

    /**
     * Allow a zoom interaction?
     */
    public setZoomFixed(zoomFixed: boolean) {
        this.getLastView().zoomFixed = zoomFixed;
        return this;
    }

    public setLayout(layout: RelativePosition) {
        this.getLastView().layout = layout;
        return this;
    }

    private setEditable(editable: boolean | undefined) {
        this.hg.editable = editable;
        return this;
    }

    private setChromInfoPath(chromInfoPath: string | undefined) {
        if (this.getLastView()) {
            this.getLastView().chromInfoPath = chromInfoPath;
        }
        this.hg.chromInfoPath = chromInfoPath;
        return this;
    }

    public addTrackSourceServers(trackSourceServers: string | undefined) {
        if (trackSourceServers && this.hg.trackSourceServers?.indexOf(trackSourceServers) === -1)
            this.hg.trackSourceServers?.push(trackSourceServers);
        return this;
    }

    public setMainTrack(track: Track) {
        if (!this.getLastView()) return this;
        this.getLastView().tracks[this.getMainTrackPosition()] = [
            {
                type: 'combined',
                // HiGlass: Having the same width between combined track and child track looks to result in incorrect scales
                width: (track.width as any) - 1,
                height: (track as any).height,
                contents: [track]
            }
        ];
        return this;
    }

    public addTrackToCombined(track: Track) {
        if (!this.getLastVisView()) return this;
        (this.getLastVisView() as any).tracks[this.getMainTrackPosition()][0]?.contents.push(track);
        return this;
    }

    public setAxisTrack(
        position: Exclude<AxisPosition, 'none'>,
        type: 'regular' | 'narrow' | 'narrower' = 'regular',
        options: {
            // These are currently used for circular layout
            layout?: 'circular' | 'linear';
            innerRadius?: number;
            outerRadius?: number;
            width?: number;
            height?: number;
            startAngle?: number;
            endAngle?: number;
        }
    ) {
        if (!this.hg.views) return this;

        const widthOrHeight = position === 'left' || position === 'right' ? 'width' : 'height';
        const axisTrackTemplate: Track = {
            uid: uuid.v1(),
            type: 'axis-track',
            chromInfoPath: this.hg.chromInfoPath,
            options: {
                ...options,
                assembly: this.getAssembly(),
                color: 'black',
                tickColor: 'black',
                tickFormat: type === 'narrower' ? 'si' : 'plain',
                tickPositions: type === 'regular' ? 'even' : 'ends',
                reverseOrientation: position === 'bottom' || position === 'right' ? true : false
            }
        };
        if (options.layout === 'circular') {
            // circular axis: superpose an axis track on top of the `center` track
            this.addTrackToCombined({
                ...axisTrackTemplate,
                options: { ...axisTrackTemplate.options, layout: 'circular' }
            });
        } else {
            // linear axis: position an axis track on the top, left, bottom, or right
            this.getLastView().tracks[position] = [
                {
                    ...axisTrackTemplate,
                    [widthOrHeight]: HIGLASS_AXIS_SIZE
                }
            ];
        }
        return this;
    }
}
