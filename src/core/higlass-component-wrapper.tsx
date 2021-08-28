/* eslint-disable react/prop-types */
import * as PIXI from 'pixi.js';
import React, { forwardRef } from 'react';

import * as gosling from '..';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
import { HiGlassSpec } from './higlass.schema';

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
        margin?: number | string;
        border?: string;
        background?: string;
    };
    id?: string;
    className?: string;
}

export const HiGlassComponentWrapper = forwardRef<HiGlassApi | undefined, HiGlassComponentWrapperProps>(
    (props, ref) => {
        // div `id` and `className` for detailed customization
        // const [wrapperDivId, setWrapperDivId] = useState(props.id ?? uuid.v4());
        // useEffect(() => {
        //     setWrapperDivId(props.id ?? uuid.v4());
        // }, [props.id]);

        // Styling
        // const { padding = 60, margin = 0, border = 'none', background } = props.options || {};
        const viewConfig = props.viewConfig || {};
        return (
            <>
                <HiGlassComponent
                    ref={ref}
                    options={{
                        // bounded: true, // deprecated
                        pixelPreciseMarginPadding: true, // this uses `rowHeight: 1` in react-grid-layout
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
            </>
        );
    }
);
