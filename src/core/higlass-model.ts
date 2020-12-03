import uuid from 'uuid';
import { HiGlassSpec, Track, View } from './higlass.schema';
import HiGlassSchema from './higlass.schema.json';
import { TOTAL_CHROMOSOME_SIZE_HG19 } from './utils/chrom-size';
import { Domain } from './geminid.schema';
import { getNumericDomain } from './utils/scales';
import { RelativePosition } from './utils/bounding-box';
import { validateSpec } from './utils/validate';
import { SUPERPOSE_VIEWCONFIG } from '../editor/example/compiled-view-config/superpose-viewconfig';

const DEFAULT_CHROMOSOME_INFO_PATH = '//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv';
export const HIGLASS_AXIS_SIZE = 30;
const HIGLASS_VIEW_TEMPLATE: View = {
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
    initialXDomain: [0, TOTAL_CHROMOSOME_SIZE_HG19],
    initialYDomain: [0, TOTAL_CHROMOSOME_SIZE_HG19],
    zoomFixed: false,
    zoomLimits: [1, null]
};

/**
 * Model for managing the HiGlass view config.
 * We are currently only using a center track with additional tracks for axes in a single view.
 */
export class HiGlassModel {
    private hg: HiGlassSpec;
    constructor() {
        this.hg = {
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
        this.setChromInfoPath(DEFAULT_CHROMOSOME_INFO_PATH);
    }

    public spec(): Readonly<HiGlassSpec> {
        return this.hg;
    }

    public addDefaultView() {
        this.hg.views.push(JSON.parse(JSON.stringify({ ...HIGLASS_VIEW_TEMPLATE, uid: uuid.v1() })));
        return this;
    }

    // Trick to add a vertical gap between tracks. We are using this trick because HiGlass `layout` do not support vertical gaps.
    public setEmptyTrack(width: number, height: number) {
        if (this.getLastView()) {
            this.getLastView().tracks.center = [
                {
                    server: 'http://higlass.io/api/v1',
                    type: 'empty',
                    width,
                    height
                }
            ];
        }
        return this;
    }

    public addBrush(
        viewId: string,
        fromViewUid?: string,
        style?: { color?: string; stroke?: string; opacity?: string; strokeWidth?: number }
    ) {
        if (!fromViewUid) return;

        // we could do this to either a `whole` track or a `center` track with `combined`
        (this.getView(viewId) as any)?.tracks.whole.push({
            type: 'viewport-projection-horizontal',
            uid: uuid.v4(),
            fromViewUid,
            options: {
                projectionFillColor: style?.color ?? '#777',
                projectionStrokeColor: style?.stroke ?? '#777',
                projectionFillOpacity: style?.opacity ?? 0.3,
                projectionStrokeOpacity: 0,
                strokeWidth: style?.strokeWidth ?? 1
            }
        });
        return this;
    }

    public getLastView() {
        return this.hg.views[this.hg.views.length - 1];
    }

    /**
     * Get the last view that renders any visualization, so skiping empty tracks.
     */
    public getLastVisView() {
        const vs = this.hg.views.filter(v => (v.tracks as any).center[0].type === 'combined');
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
            this.getLastView().initialXDomain = getNumericDomain(xDomain);
        }
        if (yDomain) {
            this.getLastView().initialYDomain = getNumericDomain(yDomain);
        }
        return this;
    }

    /**
     * Allow a zoom interaction?
     */
    public setZoomFixed(zoom?: boolean) {
        this.getLastView().zoomFixed = zoom !== undefined ? true : zoom;
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
        this.hg.chromInfoPath = chromInfoPath;
        return this;
    }

    public addTrackSourceServers(trackSourceServers: string | undefined) {
        if (trackSourceServers && this.hg.trackSourceServers?.indexOf(trackSourceServers) === -1)
            this.hg.trackSourceServers?.push(trackSourceServers);
        return this;
    }

    public setMainTrack(track: Track) {
        if (!this.hg.views) return this;
        this.getLastView().tracks.center = [
            {
                type: 'combined',
                width: track.width,
                height: (track as any).height, // TODO:
                contents: [track]
            }
        ];
        return this;
    }

    public addTrackToCombined(track: Track) {
        if (!this.getLastVisView()) return this;
        (this.getLastVisView() as any).tracks.center[0].contents.push(track);
        return this;
    }

    public setAxisTrack(position: 'left' | 'right' | 'top' | 'bottom') {
        if (!this.hg.views) return this;
        const baseTrackType = '-chromosome-labels';
        const direction = position === 'left' || position === 'right' ? 'vertical' : 'horizontal';
        const widthOrHeight = direction === 'vertical' ? 'width' : 'height';
        this.getLastView().tracks[position] = [
            {
                uid: uuid.v1(),
                type: (direction + baseTrackType) as any /* TODO */,
                [widthOrHeight]: HIGLASS_AXIS_SIZE,
                chromInfoPath: this.hg.chromInfoPath,
                options: {
                    color: 'black',
                    tickColor: 'black',
                    reverseOrientation: position === 'bottom' ? true : false
                }
            }
        ];
        return this;
    }

    /**
     * DEBUGING PURPOSE FUNCTIONS
     */
    public _addDebugView() {
        if (!this.hg.views) return this;
        this.hg.views.push(SUPERPOSE_VIEWCONFIG);
    }

    public _addGeneAnnotationTrack() {
        if (!this.hg.views) return this;
        this.getLastView().tracks.bottom = [
            {
                type: 'horizontal-gene-annotations',
                height: 90,
                tilesetUid: 'OHJakQICQD6gTD7skx4EWA',
                server: '//higlass.io/api/v1',
                uid: 'OHJakQICQD6gTD7skx4EWA',
                options: {
                    name: 'Gene Annotations (hg19)',
                    fontSize: 10,
                    labelColor: 'black',
                    labelBackgroundColor: '#ffffff',
                    labelPosition: 'hidden',
                    labelLeftMargin: 0,
                    labelRightMargin: 0,
                    labelTopMargin: 0,
                    labelBottomMargin: 0,
                    minHeight: 24,
                    plusStrandColor: 'blue',
                    minusStrandColor: 'red',
                    trackBorderWidth: 0,
                    trackBorderColor: 'black',
                    showMousePosition: false,
                    mousePositionColor: '#000000',
                    geneAnnotationHeight: 16,
                    geneLabelPosition: 'outside',
                    geneStrandSpacing: 4
                }
            }
        ];
        return this;
    }
}
