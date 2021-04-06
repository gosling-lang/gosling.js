// @ts-ignore
import { HiGlassComponent } from 'higlass';
import React, { useState, useEffect, useMemo } from 'react';
import * as gosling from '..';

/**
 * Register plugin tracks and data fetchers to HiGlass. This is necessary for the first time before using Gosling.
 */
gosling.init();

interface GoslingCompProps {
    spec?: gosling.GoslingSpec;
    compiled?: (goslingSpec: gosling.GoslingSpec, higlassSpec: gosling.HiGlassSpec) => void;
}

export function GoslingComponent(props: GoslingCompProps) {
    // Gosling and HiGlass specs
    const [gs, setGs] = useState<gosling.GoslingSpec | undefined>(props.spec);
    const [hs, setHs] = useState<gosling.HiGlassSpec>();
    const [size, setSize] = useState({ width: 200, height: 200 });

    // Just received a new Gosling spec.
    useEffect(() => {
        setGs(props.spec);
    }, [props.spec]);

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
                            // ref={hgRef}
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
}
