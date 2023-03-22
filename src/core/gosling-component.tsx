/* eslint-disable react/prop-types */
import { type HiGlassApi, HiGlassComponentWrapper } from './higlass-component-wrapper';
import React, { useState, useEffect, useMemo, useRef, forwardRef, useCallback, useImperativeHandle } from 'react';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import * as gosling from '..';
import { getTheme, type Theme } from './utils/theme';
import { createApi, type GoslingApi } from './api';
import { GoslingTemplates } from '..';
import { omitDeep } from './utils/omit-deep';
import { isEqual } from 'lodash';
import * as uuid from 'uuid';

import type { TemplateTrackDef, TrackMouseEventData } from './gosling.schema';

// Before rerendering, wait for a few time so that HiGlass container is resized already.
// If HiGlass is rendered and then the container resizes, the viewport position changes, unmatching `xDomain` specified by users.
const DELAY_FOR_CONTAINER_RESIZE_BEFORE_RERENDER = 300;

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

export type GoslingRef = {
    api: GoslingApi;
    hgApi: HiGlassApi;
};

export const GoslingComponent = forwardRef<GoslingRef, GoslingCompProps>((props, ref) => {
    const [viewConfig, setViewConfig] = useState<gosling.HiGlassSpec>();
    const [size, setSize] = useState({ width: 200, height: 200 });
    const wrapperSize = useRef<undefined | { width: number; height: number }>();
    const wrapperParentSize = useRef<undefined | { width: number; height: number }>();
    const prevSpec = useRef<undefined | gosling.GoslingSpec>();
    const trackInfos = useRef<TrackMouseEventData[]>([]);

    // HiGlass API
    // https://dev.to/wojciechmatuszewski/mutable-and-immutable-useref-semantics-with-react-typescript-30c9
    const hgRef = useRef<HiGlassApi>(null);

    const theme = getTheme(props.theme || 'light');
    const wrapperDivId = props.id ?? uuid.v4();

    // Gosling APIs
    useImperativeHandle(
        ref,
        () => {
            const hgApi = refAsReadonlyProxy(hgRef);
            const infos = refAsReadonlyProxy(trackInfos);
            const api = createApi(hgApi, viewConfig, infos, theme);
            return { api, hgApi };
        },
        [viewConfig, theme]
    );

    // TODO: add a `force` parameter since changing `linkingId` might not update vis
    const compile = useCallback(() => {
        if (props.spec) {
            const valid = gosling.validateGoslingSpec(props.spec);

            if (valid.state === 'error') {
                console.warn('Gosling spec is not valid. Please refer to the console message.');
                return;
            }

            gosling.compile(
                props.spec,
                (newHs, newSize, newGs, newTrackInfos) => {
                    // TODO: `linkingId` should be updated
                    // We may not want to re-render this
                    if (
                        prevSpec.current &&
                        isEqual(omitDeep(prevSpec.current, ['linkingId']), omitDeep(newGs, ['linkingId']))
                    ) {
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
                        setTimeout(() => {
                            hgRef.current?.api.setViewConfig(newHs);
                        }, DELAY_FOR_CONTAINER_RESIZE_BEFORE_RERENDER);
                    } else {
                        // Mount `HiGlassComponent` using this view config.
                        setViewConfig(newHs);
                    }

                    prevSpec.current = newGs;
                    trackInfos.current = newTrackInfos;
                },
                [...GoslingTemplates], // TODO: allow user definitions
                theme,
                {
                    containerSize: wrapperSize.current,
                    containerParentSize: wrapperParentSize.current
                }
            );
        }
    }, [props.spec, theme]);

    // TODO: If not necessary, do not update `wrapperSize` (i.e., when responsiveSize is not set)
    useEffect(() => {
        const containerElement = document.getElementById(wrapperDivId);
        if (!containerElement) return;

        const resizer = new ResizeSensor(containerElement, newSize => {
            if (
                !wrapperSize.current ||
                wrapperSize.current.height !== newSize.height ||
                wrapperSize.current.width !== newSize.width
            ) {
                wrapperSize.current = newSize;
                compile();
            }
        });

        const parentElement = containerElement.parentElement;
        if (!parentElement) return;

        const parentResizer = new ResizeSensor(parentElement, newSize => {
            if (
                !wrapperParentSize.current ||
                wrapperParentSize.current.height !== newSize.height ||
                wrapperParentSize.current.width !== newSize.width
            ) {
                wrapperParentSize.current = newSize;
                compile();
            }
        });

        return () => {
            resizer.detach();
            parentResizer.detach();
        };
    });

    useEffect(() => {
        compile();
    }, [props.spec, theme]);

    const responsiveHeight =
        typeof props.spec?.responsiveSize !== 'object' ? props.spec?.responsiveSize : props.spec.responsiveSize.height;

    // HiGlass component should be mounted only once
    const higlassComponent = useMemo(
        () => (
            <HiGlassComponentWrapper
                ref={hgRef}
                viewConfig={viewConfig}
                size={size}
                id={wrapperDivId}
                className={props.className}
                options={{
                    padding: props.padding,
                    border: props.border,
                    margin: props.margin,
                    responsiveWidth:
                        typeof props.spec?.responsiveSize !== 'object'
                            ? props.spec?.responsiveSize
                            : props.spec.responsiveSize.width,
                    responsiveHeight,
                    background: theme.root.background,
                    alt: props.spec?.description
                }}
            />
        ),
        [viewConfig, size, theme, responsiveHeight]
    );

    return higlassComponent;
});

GoslingComponent.displayName = 'GoslingComponent';

/** Wraps the `.current` property of a React.RefObject as a readonly object. */
function refAsReadonlyProxy<T extends object>(ref: React.RefObject<T>): Readonly<T> {
    // Readonly because because we only implement `get`.
    return new Proxy({} as Readonly<T>, {
        get(_target, prop, reciever) {
            if (!ref.current) throw Error('ref is not set!');
            return Reflect.get(ref.current, prop, reciever);
        }
    });
}
