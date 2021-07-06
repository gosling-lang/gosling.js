/* eslint-disable react/prop-types */
import * as PIXI from 'pixi.js';
import { jsPDF } from 'jspdf';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
import React, { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import * as gosling from '..';
import { View as HgView } from './higlass.schema';
import { traverseViewsInViewConfig } from '../core/utils/view-config';
import { GET_CHROM_SIZES } from './utils/assembly';
import { getTheme } from './utils/theme';
import { CommonEventData, EVENT_TYPE, MouseHoverCallback, UserDefinedEvents } from './api';
import uuid from 'uuid';

/**
 * Register plugin tracks and data fetchers to HiGlass. This is necessary for the first time before using Gosling.
 */
gosling.init();

interface GoslingCompProps {
    spec?: gosling.GoslingSpec;
    compiled?: (goslingSpec: gosling.GoslingSpec, higlassSpec: gosling.HiGlassSpec) => void;
    padding?: number;
    id?: string;
    className?: string;
}

// TODO: specify types other than "any"
export const GoslingComponent = forwardRef((props: GoslingCompProps, ref: any) => {
    // Gosling and HiGlass specs
    const [gs, setGs] = useState<gosling.GoslingSpec | undefined>(props.spec);
    const [hs, setHs] = useState<gosling.HiGlassSpec>();
    const [size, setSize] = useState({ width: 200, height: 200 });

    // Styling
    const padding = typeof props.padding !== 'undefined' ? props.padding : 60;

    // div `id` and `className` for detailed customization
    const wrapperDivId = typeof props.id !== 'undefined' ? props.id : uuid.v4();
    const wrapperDivClassName = typeof props.className !== 'undefined' ? props.className : '';

    // HiGlass API
    const hgRef = useRef<any>();

    // Gosling.js API
    const userDefinedEvents = useRef<UserDefinedEvents>({});

    /**
     * Subscribe APIs from Gosling.js tracks.
     */

    // mouseover
    useEffect(() => {
        const token = PubSub.subscribe('mouseover', (id: string, data: CommonEventData) => {
            userDefinedEvents.current.mouseover?.(data);
        });
        return () => {
            PubSub.unsubscribe(token);
        };
    });

    // Just received a new Gosling spec.
    useEffect(() => {
        setGs(props.spec);
    }, [props.spec]);

    // HiGlassMeta APIs that can be called outside the library.
    useEffect(() => {
        if (!ref) return;

        ref.current = {
            api: {
                on: (type: EVENT_TYPE, callback: MouseHoverCallback) => {
                    userDefinedEvents.current[type] = callback;
                },
                // TODO: Support assemblies (we can infer this from the spec)
                zoomTo: (viewId: string, position: string, duration = 1000) => {
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
                    const start = +s + chrStart;
                    const end = +e + chrStart;

                    hgRef?.current?.api?.zoomTo(viewId, start, end, start, end, duration);
                },
                // TODO: Support assemblies (we can infer this from the spec)
                zoomToExtent: (viewId: string, duration = 1000) => {
                    const [start, end] = [0, GET_CHROM_SIZES().total];
                    hgRef?.current?.api?.zoomTo(viewId, start, end, start, end, duration);
                },
                zoomToGene: (viewId: string, gene: string, duration = 1000) => {
                    hgRef?.current?.api?.zoomToGene(viewId, gene, duration);
                },
                getViewIds: () => {
                    if (!hs) return [];
                    const ids: string[] = [];
                    traverseViewsInViewConfig(hs, (view: HgView) => {
                        if (view.uid) ids.push(view.uid);
                    });
                    return ids;
                },
                exportPNG: (transparentBackground?: boolean) => {
                    const renderer = hgRef.current.pixiRenderer;
                    const renderTexture = PIXI.RenderTexture.create({
                        width: renderer.width / 2,
                        height: renderer.height / 2,
                        resolution: 4
                    });

                    renderer.render(hgRef.current.pixiStage, renderTexture);

                    const canvas = renderer.plugins.extract.canvas(renderTexture);

                    // Set background color for the given theme in the gosling spec
                    // Otherwise, it is transparent
                    const canvasWithBg = document.createElement('canvas') as HTMLCanvasElement;
                    canvasWithBg.width = canvas.width;
                    canvasWithBg.height = canvas.height;

                    const ctx = canvasWithBg.getContext('2d')!;
                    if (!transparentBackground) {
                        ctx.fillStyle = getTheme(gs?.theme).root.background;
                        ctx.fillRect(0, 0, canvasWithBg.width, canvasWithBg.height);
                    }
                    ctx.drawImage(canvas, 0, 0);

                    canvasWithBg.toBlob((blob: any) => {
                        const a = document.createElement('a');

                        document.body.append(a);

                        a.download = 'gosling-visualization';
                        a.href = URL.createObjectURL(blob);

                        a.click();
                        a.remove();
                    }, 'image/png');
                },
                exportPDF: (transparentBackground?: boolean) => {
                    const resolution = 4;
                    const renderer = hgRef.current.pixiRenderer;
                    const renderTexture = PIXI.RenderTexture.create({
                        width: renderer.width / 2,
                        height: renderer.height / 2,
                        resolution
                    });

                    renderer.render(hgRef.current.pixiStage, renderTexture);

                    const canvas = renderer.plugins.extract.canvas(renderTexture);

                    // Set background color for the given theme in the gosling spec
                    // Otherwise, it is transparent
                    const canvasWithBg = document.createElement('canvas') as HTMLCanvasElement;
                    canvasWithBg.width = canvas.width;
                    canvasWithBg.height = canvas.height;

                    const ctx = canvasWithBg.getContext('2d')!;
                    if (!transparentBackground) {
                        ctx.fillStyle = getTheme(gs?.theme).root.background;
                        ctx.fillRect(0, 0, canvasWithBg.width, canvasWithBg.height);
                    }
                    ctx.drawImage(canvas, 0, 0);

                    const imgData = canvasWithBg.toDataURL('image/jpeg', 1);

                    const pdf = new jsPDF({
                        orientation: canvas.width < canvas.height ? 'p' : 'l',
                        unit: 'pt',
                        format: [canvas.width, canvas.height]
                    });
                    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                    pdf.save('gosling-visualization.pdf');
                }
            }
        };
    }, [ref, hgRef, hs]);

    useEffect(() => {
        if (gs) {
            const valid = gosling.validateGoslingSpec(gs);

            if (valid.state === 'error') {
                console.warn('Gosling spec is not valid. Please refer to the console message.');
                return;
            }

            gosling.compile(gs, (newHs: gosling.HiGlassSpec, newSize: { width: number; height: number }) => {
                if (props.compiled) {
                    // If a callback function is provided, return compiled information.
                    props.compiled(gs, newHs);
                }
                setHs(newHs);
                setSize(newSize);
            });
        }
    }, [gs]);

    const higlassComponent = useMemo(() => {
        return hs && size ? (
            <>
                <div
                    id={wrapperDivId}
                    className={`gosling-component ${wrapperDivClassName}`}
                    style={{
                        position: 'relative',
                        padding,
                        background: getTheme(gs?.theme).root.background,
                        width: size.width + padding * 2,
                        height: size.height + padding * 2,
                        textAlign: 'left'
                    }}
                >
                    <div
                        key={JSON.stringify(hs)}
                        className="higlass-wrapper"
                        style={{
                            position: 'relative',
                            display: 'block',
                            background: getTheme(gs?.theme).root.background,
                            margin: 0,
                            padding: 0, // non-zero padding acts unexpectedly w/ HiGlassComponent
                            width: size.width,
                            height: size.height
                        }}
                    >
                        <HiGlassComponent
                            ref={hgRef}
                            options={{
                                bounded: true,
                                containerPaddingX: 0,
                                containerPaddingY: 0,
                                viewMarginTop: 0,
                                viewMarginBottom: 0,
                                viewMarginLeft: 0,
                                viewMarginRight: 0,
                                viewPaddingTop: 0,
                                viewPaddingBottom: 0,
                                viewPaddingLeft: 0,
                                viewPaddingRight: 0,
                                sizeMode: 'bounded',
                                // theme: gs?.theme, // TODO: do we need this?
                                rangeSelectionOnAlt: true // this allows switching between `selection` and `zoom&pan` mode
                            }}
                            viewConfig={hs}
                        />
                    </div>
                </div>
            </>
        ) : null;
    }, [hs, size]);

    return higlassComponent;
});
