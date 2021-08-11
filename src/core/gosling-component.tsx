/* eslint-disable react/prop-types */
import { HiGlassApi, HiGlassComponentWrapper } from './higlass-component-wrapper';
import React, { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import * as gosling from '..';
import { getTheme, Theme } from './utils/theme';
import { createApi, Api } from './api';
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

export const GoslingComponent = forwardRef<{ api: Api } | undefined, GoslingCompProps>((props, ref) => {
    // Gosling and HiGlass specs
    const [gs, setGs] = useState<gosling.GoslingSpec | undefined>(props.spec);
    const [hs, setHs] = useState<gosling.HiGlassSpec>();
    const [size, setSize] = useState({ width: 200, height: 200 });
    const theme = getTheme(props.theme || 'light');

    // HiGlass API
    const hgRef = useRef<HiGlassApi>();

    // Just received a new Gosling spec.
    useEffect(() => {
        setGs(props.spec);
    }, [props.spec]);

    // HiGlassMeta APIs that can be called outside the library.
    useEffect(() => {
        if (!ref) return;
        const api = createApi(hgRef, hs, theme);
        if (typeof ref == 'function') {
            ref({ api });
        } else {
            ref.current = { api };
        }
    }, [ref, hgRef, hs, theme]);

    useEffect(() => {
        if (gs) {
            const valid = gosling.validateGoslingSpec(gs);

            if (valid.state === 'error') {
                console.warn('Gosling spec is not valid. Please refer to the console message.');
                return;
            }

            gosling.compile(
                gs,
                (newHs: gosling.HiGlassSpec, newSize: { width: number; height: number }) => {
                    if (props.compiled) {
                        // If a callback function is provided, return compiled information.
                        props.compiled(gs, newHs);
                    }
                    setHs(newHs);
                    setSize(newSize);
                },
                [...GoslingTemplates], // TODO: allow user definitions
                theme
            );
        }
    }, [gs, theme]);

    const higlassComponent = useMemo(
        () => (
            <HiGlassComponentWrapper
                ref={hgRef}
                viewConfig={hs}
                size={size}
                id={props.id}
                className={props.className}
                options={{
                    padding: props.padding,
                    border: props.border,
                    margin: props.margin,
                    theme: theme
                }}
            />
        ),
        [hs, size, theme]
    );

    return higlassComponent;
});
