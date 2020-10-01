import Ajv from 'ajv';
import uuid from 'uuid';
import { HiGlassSpec, Track, View } from './higlass.schema';
import HiGlassSchema from './higlass.schema.json';
import { TOTAL_CHROMOSOME_SIZE_HG19 } from './utils/chrom-size';
import { Domain } from './gemini.schema';
import { getNumericDomain } from './utils/scales';
import { RelativePosition } from './utils/bounding-box';

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

    public getLastView() {
        return this.hg.views[this.hg.views.length - 1];
    }

    public validateSpec() {
        const validate = new Ajv({ extendRefs: true }).compile(HiGlassSchema);
        const valid = validate(this.spec());

        if (validate.errors) {
            console.warn(JSON.stringify(validate.errors, null, 2));
        }

        return valid as boolean;
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
        this.hg.zoomFixed = zoom !== undefined ? true : zoom;
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
        this.getLastView().tracks.center = [track];
        return this;
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
                chromInfoPath: this.hg.chromInfoPath
            }
        ];
        return this;
    }
}
