/* eslint-disable react/prop-types */
import type * as PIXI from 'pixi.js';
import React, { useEffect, useState, forwardRef, useMemo } from 'react';

import * as gosling from '..';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
import type { HiGlassSpec } from '@gosling-lang/higlass-schema';
import { uuid } from '../core/utils/uuid';

/**
 * Register plugin tracks and data fetchers to HiGlass. This is necessary for the first time before using Gosling.
 */
gosling.init();

// TODO: Complete the API
export type HiGlassApi = {
    api: Record<string, any>;
    pixiRenderer: PIXI.Renderer;
    pixiStage: PIXI.IRenderableObject;
};

export interface HiGlassComponentWrapperProps {
    size: { width: number; height: number };
    viewConfig?: HiGlassSpec;
    options: {
        padding?: number;
        margin?: number;
        border?: string;
        background?: string;
        responsiveWidth?: boolean;
        responsiveHeight?: boolean;
        alt?: string;
    };
    id?: string;
    className?: string;
}

export const HiGlassComponentWrapper = forwardRef<HiGlassApi | undefined, HiGlassComponentWrapperProps>(
    (props, ref) => {
        // div `id` and `className` for detailed customization
        const [wrapperDivId, setWrapperDivId] = useState(props.id ?? uuid());
        useEffect(() => {
            setWrapperDivId(props.id ?? uuid());
        }, [props.id]);

        const viewConfig = props.viewConfig || {};
        const pixelPreciseMarginPadding = false; // !props.options.responsiveHeight;
        const higlassComponent = useMemo(
            () => (
                <HiGlassComponent
                    ref={ref}
                    options={{
                        // This uses `rowHeight: 1` in react-grid-layout, allowing to set height precisely.
                        // Since using this disallows responsive resizing of track heights in HiGlass,
                        // we need to use this only when users do not want to use responsive height.
                        // (See https://github.com/higlass/higlass/blob/2a3786e13c2415a52abc1227f75512f128e784a0/app/scripts/HiGlassComponent.js#L2199)
                        pixelPreciseMarginPadding,

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
                    viewConfig={viewConfig}
                />
            ),
            [viewConfig, pixelPreciseMarginPadding]
        );

        // Styling
        const {
            padding = 60,
            margin = 0,
            border = 'none',
            background,
            alt = 'Gosling visualization'
        } = props.options || {};
        return (
            <>
                <div
                    id={wrapperDivId}
                    className={`gosling-component ${props.className || ''}`}
                    style={{
                        position: 'relative',
                        padding: padding,
                        margin: margin,
                        border: border,
                        background: background,
                        width: props.options.responsiveWidth ? `calc(100% - ${padding * 2}px)` : props.size.width,
                        height: props.options.responsiveHeight ? `calc(100% - ${padding * 2}px)` : props.size.height,
                        textAlign: 'left'
                    }}
                    aria-label={alt}
                    role={'graphics-document'} // https://www.w3.org/TR/graphics-aria-1.0/#graphics-document
                    aria-roledescription="visualization"
                >
                    <div
                        key={JSON.stringify(viewConfig)}
                        id="higlass-wrapper"
                        className="higlass-wrapper"
                        style={{
                            position: 'relative',
                            display: 'block',
                            background: background,
                            margin: 0,
                            padding: 0, // non-zero padding acts unexpectedly w/ HiGlassComponent
                            width: props.options.responsiveWidth ? '100%' : props.size.width,
                            height: props.options.responsiveHeight ? '100%' : props.size.height
                        }}
                        // onClick={(e) => {
                        //     PubSub.publish('gosling.click', {
                        //         mouseX: e.pageX - (document.getElementById('higlass-wrapper')?.offsetLeft ?? 0),
                        //         mouseY: e.pageY - (document.getElementById('higlass-wrapper')?.offsetTop ?? 0)
                        //     });
                        // }}
                    >
                        {higlassComponent}
                    </div>
                </div>
            </>
        );
    }
);

HiGlassComponentWrapper.displayName = 'HiGlassComponentWrapper';
