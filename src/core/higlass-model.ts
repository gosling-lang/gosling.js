import Ajv from 'ajv';
import uuid from 'uuid';
import { HiGlassSpec, Track } from './higlass.schema';
import HiGlassSchema from './higlass.schema.json';
import { TOTAL_CHROM_SIZE_HG19, CHROM_RANGE_HG19 } from './utils/chrom-size';
import { Domain, IsDomainChr, IsDomainInterval, IsDomainChrInterval, IsDomainGene } from './gemini.schema';

const DEFAULT_CHROMOSOME_INFO_PATH = '//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv';
export const HIGLASS_AXIS_SIZE = 30;

/**
 * Model for managing the HiGlass view config.
 * We are currently only using a center track with additional tracks for axes in a single view.
 */
export class HiGlassModel {
    private hg: HiGlassSpec;
    constructor() {
        this.hg = {};

        // Add default specs.
        this.setEditable(false);
        this.setChromInfoPath(DEFAULT_CHROMOSOME_INFO_PATH);
        this.hg.trackSourceServers = [];
        this.hg.views = [
            {
                uid: uuid.v1(),
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
                initialXDomain: [0, TOTAL_CHROM_SIZE_HG19],
                initialYDomain: [0, TOTAL_CHROM_SIZE_HG19],
                zoomLimits: [1, null]
            }
        ];
    }

    public spec(): Readonly<HiGlassSpec> {
        return this.hg;
    }

    private getNumericDomain(domain: Domain) {
        if (IsDomainChr(domain)) {
            return CHROM_RANGE_HG19[`chr${domain.chromosome}`];
        } else if (IsDomainInterval(domain)) {
            return domain.interval;
        } else if (IsDomainChrInterval(domain)) {
            const chrStart = CHROM_RANGE_HG19[`chr${domain.chromosome}`][0];
            const [start, end] = domain.interval;
            return [chrStart + start, chrStart + end];
        } else if (IsDomainGene(domain)) {
            // TODO: Not supported yet
        }
    }
    public setDomain(xDomain: Domain | undefined, yDomain: Domain | undefined) {
        if (xDomain && this.hg.views?.[0]) {
            this.hg.views[0].initialXDomain = this.getNumericDomain(xDomain);
        }
        if (yDomain && this.hg.views?.[0]) {
            this.hg.views[0].initialYDomain = this.getNumericDomain(yDomain);
        }
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
        this.hg.views[0].tracks.center = [track];
        return this;
    }

    public _addGeneAnnotationTrack() {
        if (!this.hg.views) return this;
        this.hg.views[0].tracks.bottom = [
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
        this.hg.views[0].tracks[position] = [
            {
                uid: uuid.v1(),
                type: (direction + baseTrackType) as any /* TODO */,
                [widthOrHeight]: HIGLASS_AXIS_SIZE,
                chromInfoPath: this.hg.chromInfoPath
            }
        ];
        return this;
    }

    public validateSpec() {
        const validate = new Ajv({ extendRefs: true }).compile(HiGlassSchema);
        const valid = validate(this.spec());

        if (validate.errors) {
            console.warn(JSON.stringify(validate.errors, null, 2));
        }

        return valid as boolean;
    }
}
