/* eslint-disable react/prop-types */
// @ts-ignore
import { HiGlassComponent } from 'higlass';
import React, { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import * as gosling from '..';
import { View as HgView } from './higlass.schema';
import { traverseViewsInViewConfig } from '../core/utils/view-config';
import { GET_CHROM_SIZES } from './utils/assembly';

/**
 * Register plugin tracks and data fetchers to HiGlass. This is necessary for the first time before using Gosling.
 */
gosling.init();

interface GoslingCompProps {
    spec?: gosling.GoslingSpec;
    compiled?: (goslingSpec: gosling.GoslingSpec, higlassSpec: gosling.HiGlassSpec) => void;
}

// TODO: specify types other than "any"
export const GoslingComponent = forwardRef((props: GoslingCompProps, ref: any) => {
    // Gosling and HiGlass specs
    const [gs, setGs] = useState<gosling.GoslingSpec | undefined>(props.spec);
    const [hs, setHs] = useState<gosling.HiGlassSpec>();
    const [size, setSize] = useState({ width: 200, height: 200 });

    // HiGlass API
    const hgRef = useRef<any>();

    // Just received a new Gosling spec.
    useEffect(() => {
        setGs(props.spec);
    }, [props.spec]);

    // HiGlassMeta APIs that can be called outside the library.
    useEffect(() => {
        if (!ref) return;

        ref.current = {
            api: {
                // TODO: Support assemblies
                zoomTo: (viewId: string, position: string) => {
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

                    hgRef?.current?.api?.zoomTo(viewId, start, end, start, end, 1000);
                },
                zoomToGene: (viewId: string, gene: string) => {
                    hgRef?.current?.api?.zoomToGene(viewId, gene, 1000);
                },
                getViewIds: () => {
                    if (!hs) return [];
                    const ids: string[] = [];
                    traverseViewsInViewConfig(hs, (view: HgView) => {
                        if (view.uid) ids.push(view.uid);
                    });
                    return ids;
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
                    style={{
                        position: 'relative',
                        padding: 60,
                        background: 'white',
                        width: size.width + 120,
                        height: size.height + 120,
                        textAlign: 'left'
                    }}
                >
                    <div
                        key={JSON.stringify(hs)}
                        style={{
                            position: 'relative',
                            display: 'block',
                            background: 'white',
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
