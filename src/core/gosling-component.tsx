/* eslint-disable react/prop-types */
import { HiGlassApi, HiGlassComponentWrapper } from './higlass-component-wrapper';
import React, { useState, useEffect, useMemo, useRef, forwardRef, useCallback } from 'react';
import { ResizeSensor } from 'css-element-queries';
import * as gosling from '..';
import { getTheme, Theme } from './utils/theme';
import { createApi, GoslingApi } from './api';
import { TemplateTrackDef } from './gosling.schema';
import { GoslingTemplates } from '..';
import { isEqual } from 'lodash';

interface GoslingCompProps {
    spec?: gosling.GoslingSpec;
    compiled?: (goslingSpec: gosling.GoslingSpec, higlassSpec: gosling.HiGlassSpec) => void;
    padding?: number;
    margin?: number;
    border?: string;
    id?: string;
    className?: string;
    theme?: Theme;
    templates?: TemplateTrackDef[];
    experimental?: {
        reactive?: boolean;
    };
}

export const GoslingComponent = forwardRef<
    { api: GoslingApi; hgRef: React.RefObject<HiGlassApi | undefined> | HiGlassApi },
    GoslingCompProps
>((props, ref) => {
    const [viewConfig, setViewConfig] = useState<gosling.HiGlassSpec>();
    const [size, setSize] = useState({ width: 200, height: 200 });
    const wrapperSize = useRef<undefined | { width: number; height: number }>();
    const prevSpec = useRef<undefined | gosling.GoslingSpec>();

    // HiGlass API
    const hgRef = useRef<HiGlassApi>();

    const theme = getTheme(props.theme || 'light');

    // Gosling APIs
    useEffect(() => {
        if (!ref) return;
        const api = createApi(hgRef, viewConfig, theme);
        if (typeof ref == 'function') {
            ref({ hgRef, api });
        } else {
            ref.current = { hgRef, api };
        }
    }, [ref, hgRef, viewConfig, theme]);

    const compile = useCallback(() => {
        if (props.spec) {
            const valid = gosling.validateGoslingSpec(props.spec);

            if (valid.state === 'error') {
                console.warn('Gosling spec is not valid. Please refer to the console message.');
                return;
            }

            gosling.compile(
                props.spec,
                (newHs, newSize, newGs) => {
                    // TODO: `linkingId` should be updated
                    // We may not want to re-render this
                    if (prevSpec.current && isEqual(prevSpec.current, newGs)) {
                        return;
                    }

                    // If a callback function is provided, return compiled information.
                    props.compiled?.(props.spec!, newHs);

                    // Change the size of wrapper `<div/>` elements
                    setSize(newSize);

                    // Update the compiled view config
                    const isMountedOnce = typeof viewConfig !== 'undefined';
                    if (props.experimental?.reactive && isMountedOnce) {
                        // Use API to update visualization.
                        hgRef.current?.api.setViewConfig(newHs);
                    } else {
                        // Mount `HiGlassComponent` using this view config.
                        setViewConfig(newHs);
                    }

                    prevSpec.current = newGs;
                },
                [...GoslingTemplates], // TODO: allow user definitions
                theme,
                wrapperSize.current
            );
        }
    }, [props.spec, theme]);

    useEffect(() => {
        const parentElement = document.getElementById('higlass-wrapper');
        if (!parentElement) return;

        const resizer = new ResizeSensor(parentElement, newSize => {
            if (
                !wrapperSize.current ||
                wrapperSize.current.height !== newSize.height ||
                wrapperSize.current.width !== newSize.width
            ) {
                wrapperSize.current = newSize;
                compile();
            }
        });
        return () => {
            resizer.detach();
        };
    });

    useEffect(() => {
        compile();
    }, [props.spec, theme]);

    // HiGlass component should be mounted only once
    const higlassComponent = useMemo(
        () => (
            <HiGlassComponentWrapper
                ref={hgRef}
                viewConfig={viewConfig}
                size={size}
                id={props.id}
                className={props.className}
                options={{
                    padding: props.padding,
                    border: props.border,
                    margin: props.margin,
                    responsiveWidth:
                        typeof props.spec?.responsiveSize !== 'object'
                            ? props.spec?.responsiveSize
                            : props.spec.responsiveSize.width,
                    responsiveHeight:
                        typeof props.spec?.responsiveSize !== 'object'
                            ? props.spec?.responsiveSize
                            : props.spec.responsiveSize.height,
                    background: theme.root.background
                }}
            />
        ),
        [viewConfig, size, theme]
    );

    return higlassComponent;
});
