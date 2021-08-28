/* eslint-disable react/prop-types */
import { HiGlassApi, HiGlassComponentWrapper } from './higlass-component-wrapper';
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
    const [initViewConfig, setInitViewConfig] = useState<gosling.HiGlassSpec>();
    const [size, setSize] = useState({ width: 200, height: 200 });

    // HiGlass API
    const hgRef = useRef<HiGlassApi>();

    const theme = getTheme(props.theme || 'light');

    // Gosling APIs
    useEffect(() => {
        if (!ref) return;
        const api = createApi(hgRef, initViewConfig, theme);
        if (typeof ref == 'function') {
            ref({ api });
        } else {
            ref.current = { api };
        }
    }, [ref, hgRef, initViewConfig, theme]);

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
                    if (!initViewConfig) {
                        setInitViewConfig(newHs);
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
        () => (
            <HiGlassComponentWrapper
                ref={hgRef}
                viewConfig={initViewConfig}
                size={size}
                id={props.id}
                className={props.className}
                options={{
                    padding: props.padding,
                    border: props.border,
                    margin: props.margin,
                    background: theme.root.background
                }}
            />
        ),
        [initViewConfig, size, theme]
    );

    return higlassComponent;
});
