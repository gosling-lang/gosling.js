import * as PIXI from 'pixi.js';
import type { TrackMouseEventData } from '@gosling.schema';
import type { HiGlassApi } from './higlass-component-wrapper';
import type { HiGlassSpec } from './higlass.schema';
import { subscribe, unsubscribe } from './pubsub';
import { GET_CHROM_SIZES, parseGenomicPosition } from './utils/assembly';
import type { CompleteThemeDeep } from './utils/theme';
import { traverseViewsInViewConfig } from './utils/view-config';

/**
 * Information of suggested genes.
 */
interface GeneSuggestion {
    geneName: string; // gene symbol
    score: number; // higher score means suggested gene is more likely to match the searched keyword
    chr: string; // chromosome name
    txStart: number; // absolute genomic position assuming chromosomes are concat end-to-end
    txEnd: number; // absolute genomic position assuming chromosomes are concat end-to-end
}

export interface GoslingApi {
    subscribe: typeof subscribe;
    unsubscribe: typeof unsubscribe;
    zoomTo(viewId: string, position: string, padding?: number, duration?: number): void;
    zoomToExtent(viewId: string, duration?: number): void;
    zoomToGene(viewId: string, gene: string, padding?: number, duration?: number): void;
    suggestGene(viewId: string, keyword: string, callback: (suggestions: GeneSuggestion[]) => void): void;
    getViewIds(): string[];
    getTracks(): TrackMouseEventData[];
    getTrack(trackId: string): TrackMouseEventData | undefined;
    exportPng(transparentBackground?: boolean): void;
    exportPdf(transparentBackground?: boolean): void;
    getCanvas(options?: { resolution?: number; transparentBackground?: boolean }): {
        canvas: HTMLCanvasElement;
        canvasWidth: number;
        canvasHeight: number;
        resolution: number;
    };
}

export function createApi(
    hg: HiGlassApi,
    hgSpec: HiGlassSpec | undefined,
    trackInfos: TrackMouseEventData[],
    theme: Required<CompleteThemeDeep>
): GoslingApi {
    const getTracks = () => {
        return trackInfos;
    };
    const getTrack = (trackId: string) => {
        const trackInfoFound = trackInfos.find(d => d.id === trackId);
        if (!trackInfoFound) {
            console.warn(`[getTrack()] Unable to find a track using the ID (${trackId})`);
        }
        return trackInfoFound;
    };
    const getCanvas: GoslingApi['getCanvas'] = options => {
        const resolution = options?.resolution ?? 4;
        const transparentBackground = options?.transparentBackground ?? false;

        const renderer = hg.pixiRenderer;
        const renderTexture = PIXI.RenderTexture.create({
            width: renderer.width / 2,
            height: renderer.height / 2,
            resolution
        });

        renderer.render(hg.pixiStage, renderTexture);

        const canvas = renderer.plugins.extract.canvas(renderTexture);

        // Set background color for the given theme in the gosling spec
        // Otherwise, it is transparent
        const canvasWithBg = document.createElement('canvas') as HTMLCanvasElement;
        canvasWithBg.width = canvas.width;
        canvasWithBg.height = canvas.height;

        const ctx = canvasWithBg.getContext('2d')!;
        if (!transparentBackground) {
            ctx.fillStyle = theme.root.background;
            ctx.fillRect(0, 0, canvasWithBg.width, canvasWithBg.height);
        }
        ctx.drawImage(canvas, 0, 0);

        return {
            canvas: canvasWithBg,
            resolution,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height
        };
    };
    return {
        subscribe,
        unsubscribe,
        zoomTo: (viewId, position, padding = 0, duration = 1000) => {
            // Accepted input: 'chr1' or 'chr1:1-1000'
            if (!position.includes('chr')) {
                console.warn('Genomic interval you entered is not in a correct form.');
                return;
            }
            const assembly = getTrack(viewId)?.spec.assembly;
            const chromInfo = GET_CHROM_SIZES(assembly);
            const parsed = parseGenomicPosition(position);
            const { chromosome: chr } = parsed;
            let { start, end } = parsed;
            if (!chr || chromInfo.interval[chr]) {
                console.warn('Chromosome name is not valid', chr);
                return;
            }
            if (typeof start === 'undefined' || typeof end === 'undefined') {
                // if only a chromosome name is specified, zoom to the extent of the chromosome
                [start, end] = [0, chromInfo.size[chr]];
            }
            const chrOffset = chromInfo.interval[chr][0];
            const relativeGenomicPositions = [start + chrOffset - padding, end + chrOffset + padding];
            hg.api.zoomTo(viewId, ...relativeGenomicPositions, ...relativeGenomicPositions, duration);
        },
        zoomToExtent: (viewId, duration = 1000) => {
            const assembly = getTrack(viewId)?.spec.assembly;
            const [start, end] = [0, GET_CHROM_SIZES(assembly).total];
            hg.api.zoomTo(viewId, start, end, start, end, duration);
        },
        zoomToGene: (viewId, gene, padding = 0, duration = 1000) => {
            hg.api.zoomToGene(viewId, gene, padding, duration);
        },
        suggestGene: (viewId: string, keyword: string, callback: (suggestions: GeneSuggestion[]) => void) => {
            hg.api.suggestGene(viewId, keyword, callback);
        },
        getViewIds: () => {
            if (!hgSpec) return [];
            const ids: string[] = [];
            traverseViewsInViewConfig(hgSpec, view => {
                if (view.uid) ids.push(view.uid);
            });
            return ids;
        },
        getTracks,
        getTrack,
        getCanvas,
        exportPng: transparentBackground => {
            const { canvas } = getCanvas({ resolution: 4, transparentBackground });
            canvas.toBlob(blob => {
                const a = document.createElement('a');
                document.body.append(a);
                a.download = 'gosling-visualization';
                a.href = URL.createObjectURL(blob!);
                a.click();
                a.remove();
            }, 'image/png');
        },
        exportPdf: async transparentBackground => {
            const { jsPDF } = await import('jspdf');
            const { canvas } = getCanvas({ resolution: 4, transparentBackground });
            const imgData = canvas.toDataURL('image/jpeg', 1);
            const pdf = new jsPDF({
                orientation: canvas.width < canvas.height ? 'p' : 'l',
                unit: 'pt',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
            pdf.save('gosling-visualization.pdf');
        }
    };
}
