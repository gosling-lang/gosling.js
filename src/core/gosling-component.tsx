/* eslint-disable react/prop-types */
import { HiGlassApi, HiGlassComponentWrapper } from './higlass-component-wrapper';
import uuid from 'uuid';
import React, { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import * as gosling from '..';
import { getTheme, Theme } from './utils/theme';
import { createApi, GoslingApi } from './api';
import { TemplateTrackDef } from './gosling.schema';
import { GoslingTemplates } from '..';

interface GoslingCompProps {
    spec?: gosling.GoslingSpec;
    compiled?: (goslingSpec: gosling.GoslingSpec, higlassSpec: gosling.HiGlassSpec) => void;
    padding?: number;
    margin?: number | string;
    border?: string;
    id?: string;
    className?: string;
    theme?: Theme;
    templates?: TemplateTrackDef[];
}

export const GoslingComponent = forwardRef<{ api: GoslingApi }, GoslingCompProps>((props, ref) => {
    const [initHs, setInitHs] = useState<gosling.HiGlassSpec>();
    const [size, setSize] = useState({ width: 200, height: 200 });

    // HiGlass API
    const hgRef = useRef<HiGlassApi>();

    const theme = getTheme(props.theme || 'light');

    // Gosling APIs
    useEffect(() => {
        if (!ref) return;
        const api = createApi(hgRef, initHs, theme);
        if (typeof ref == 'function') {
            ref({ api });
        } else {
            ref.current = { api };
        }
    }, [ref, hgRef, initHs, theme]);

    useEffect(() => {
        if (props.spec) {
            const valid = gosling.validateGoslingSpec(props.spec);

            if (valid.state === 'error') {
                console.warn('Gosling spec is not valid. Please refer to the console message.');
                return;
            }

            gosling.compile(
                props.spec,
                (newHs, newSize) => {
                    // If a callback function is provided, return compiled information.
                    props.compiled?.(props.spec!, newHs);
                    setSize(newSize); // change the wrapper's size
                    if (!initHs) {
                        setInitHs(newHs);
                    } else {
                        // This allows reactive rendering if track ids are used
                        hgRef.current?.api.setViewConfig(newHs);
                    }
                },
                [...GoslingTemplates], // TODO: allow user definitions
                theme
            );
        }
    }, [props.spec, theme]);

    // HiGlass component should be mounted only once
    const higlassComponent = useMemo(
        () => (initHs ? <HiGlassComponentWrapper ref={hgRef} viewConfig={initHs} /> : null),
        [initHs]
    );

    // This determines the size, padding, and margin of the visualization
    const higlassComponetWrapper = useMemo(
        () => (
            <div
                id={props.id ?? uuid.v4()}
                className={`gosling-component ${props.className || ''}`}
                style={{
                    position: 'relative',
                    padding: props.padding ?? 60,
                    margin: props.margin ?? 0,
                    border: props.border ?? 'none',
                    background: theme.root.background,
                    width: size.width + (props.padding ?? 60) * 2,
                    height: size.height + (props.padding ?? 60) * 2,
                    textAlign: 'left'
                }}
            >
                <div
                    id="higlass-wrapper"
                    className="higlass-wrapper"
                    style={{
                        position: 'relative',
                        display: 'block',
                        background: theme.root.background,
                        margin: 0,
                        padding: 0, // non-zero padding acts unexpectedly w/ HiGlassComponent
                        width: size.width,
                        height: size.height
                    }}
                >
                    {higlassComponent}
                </div>
            </div>
        ),
        [
            higlassComponent,
            size,
            props.id,
            props.className,
            props.padding,
            props.margin,
            props.border,
            theme.root.background
        ]
    );

    return higlassComponetWrapper;
});
