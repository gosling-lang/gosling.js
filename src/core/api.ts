import * as PIXI from 'pixi.js';
import { Datum } from './gosling.schema';
import { HiGlassApi } from './higlass-component-wrapper';
import { HiGlassSpec } from './higlass.schema';
import { GET_CHROM_SIZES } from './utils/assembly';
import { CompleteThemeDeep } from './utils/theme';
import { traverseViewsInViewConfig } from './utils/view-config';

export type CommonEventData = {
    data: Datum;
    genomicPosition: string;
};

// Utility type for building strongly typed PubSub API.
//
// Add named events using a string union for `EventName`
//
// - Two different events ('mouseover' & 'my-event') with the same payload
//
// PubSubEvent<'mouseover' | 'my-event', { same: 'payload' }>
type PubSubEvent<EventName extends string, Payload> = {
    [Key in EventName]: Payload;
};

// New `PubSubEvent`s should be added to the `EventMap`...
type EventMap = PubSubEvent<'mouseover' | 'click', CommonEventData>;
// & PubSubEvent<'my-event', { hello: 'world' }> & PubSubEvent<'foo', "bar">;

/**
 * Information of suggested genes.
 */
interface geneSuggestion {
    geneName: string; // gene symbol
    score: number; // higher score means suggested gene is more likely to match the searched keyword
    chr: string; // chromosome name
    txStart: number; // absolute genomic position assuming chromosomes are concat end-to-end
    txEnd: number; // absolute genomic position assuming chromosomes are concat end-to-end
}

export interface GoslingApi {
    subscribe<EventName extends keyof EventMap>(
        type: EventName,
        callback: (message: string, payload: EventMap[EventName]) => void
    ): void;
    unsubscribe(tokenOrFunction: string | ((...args: unknown[]) => unknown)): void;
    zoomTo(viewId: string, position: string, padding?: number, duration?: number): void;
    zoomToExtent(viewId: string, duration?: number): void;
    zoomToGene(viewId: string, gene: string, padding?: number, duration?: number): void;
    suggestGene(viewId: string, keyword: string, callback: (suggestions: geneSuggestion[]) => void): void;
    getViewIds(): string[];
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
    hgRef: React.RefObject<HiGlassApi | undefined> | HiGlassApi,
    hgSpec: HiGlassSpec | undefined,
    theme: Required<CompleteThemeDeep>
): GoslingApi {
    const getHg = () => {
        // Safely get higlass API
        if ('api' in hgRef) return hgRef;
        if (hgRef.current) return hgRef.current;
        throw new Error('HiGlass ref not initalized');
    };
    const getCanvas: GoslingApi['getCanvas'] = options => {
        const hg = getHg();
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
        subscribe: (type, callback) => {
            switch (type) {
                case 'mouseover':
                    return PubSub.subscribe(type, callback);
                case 'click':
                    return PubSub.subscribe(type, callback);
                default: {
                    console.error(`Event type not recognized, got ${JSON.stringify(type)}.`);
                    return undefined;
                }
            }
        },
        unsubscribe: tokenOrFunction => PubSub.unsubscribe(tokenOrFunction),
        // TODO: Support assemblies (we can infer this from the spec)
        zoomTo: (viewId, position, padding = 0, duration = 1000) => {
            // Accepted input: 'chr1' or 'chr1:1-1000'
            if (!position.includes('chr')) {
                console.warn('Genomic interval you entered is not in a correct form.');
                return;
            }

            const chr = position.split(':')[0];
            const chrStart = GET_CHROM_SIZES().interval?.[chr]?.[0];

            if (!chr || typeof chrStart === undefined) {
                console.warn('Chromosome name is not valid', chr);
                return;
            }

            const [s, e] = position.split(':')[1]?.split('-') ?? [0, GET_CHROM_SIZES().size[chr]];
            const start = +s + chrStart - padding;
            const end = +e + chrStart + padding;

            getHg().api.zoomTo(viewId, start, end, start, end, duration);
        },
        // TODO: Support assemblies (we can infer this from the spec)
        zoomToExtent: (viewId, duration = 1000) => {
            const [start, end] = [0, GET_CHROM_SIZES().total];
            getHg().api.zoomTo(viewId, start, end, start, end, duration);
        },
        zoomToGene: (viewId, gene, padding = 0, duration = 1000) => {
            getHg().api.zoomToGene(viewId, gene, padding, duration);
        },
        suggestGene: (viewId: string, keyword: string, callback: (suggestions: geneSuggestion[]) => void) => {
            getHg().api.suggestGene(viewId, keyword, callback);
        },
        getViewIds: () => {
            if (!hgSpec) return [];
            const ids: string[] = [];
            traverseViewsInViewConfig(hgSpec, view => {
                if (view.uid) ids.push(view.uid);
            });
            return ids;
        },
        getCanvas: getCanvas,
        exportPng: transparentBackground => {
            const { canvas } = getCanvas({ resolution: 4, transparentBackground });
            canvas.toBlob(blob => {
                const a = document.createElement('a');
                document.body.append(a);
                a.download = 'gosling-visualization';
                a.href = URL.createObjectURL(blob);
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
