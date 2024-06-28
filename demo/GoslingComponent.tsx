import React, { useState, useEffect } from 'react';
import { PixiManager } from '@pixi-manager';

import { compile } from '../src/compiler/compile';
import { getTheme } from '../src/core/utils/theme';

import type { HiGlassSpec } from '@gosling-lang/higlass-schema';
import { createTrackDefs, renderTrackDefs, showTrackInfoPositions } from './renderer/main';
import type { TrackInfo } from 'src/compiler/bounding-box';
import type { GoslingSpec } from 'gosling.js';
import { getLinkedEncodings } from './renderer/linkedEncoding';

interface GoslingComponentProps {
    spec: GoslingSpec;
    width: number;
    height: number;
}
export function GoslingComponent({ spec, width, height }: GoslingComponentProps) {
    const [fps, setFps] = useState(120);

    useEffect(() => {
        // Create the new plot
        const plotElement = document.getElementById('plot') as HTMLDivElement;
        plotElement.innerHTML = '';
        // Initialize the PixiManager. This will be used to get containers and overlay divs for the plots
        const pixiManager = new PixiManager(width, height, plotElement, setFps);
        // addTextTrack(pixiManager);
        // addDummyTrack(pixiManager);
        // addCircularBrush(pixiManager);
        // addGoslingTrack(pixiManager);
        // addAxisTrack(pixiManager);
        // addLinearBrush(pixiManager);
        // addBigwig(pixiManager);
        // addHeatmap(pixiManager);
        // addLeftAxisTrack(pixiManager);
        // addGoslingVertical(pixiManager);

        const callback = (
            hg: HiGlassSpec,
            size,
            gs: GoslingSpec,
            tracksAndViews,
            idTable,
            trackInfos: TrackInfo[],
            theme: Require<ThemeDeep>
        ) => {
            console.warn(trackInfos);
            console.warn(tracksAndViews);
            console.warn(gs);
            // showTrackInfoPositions(trackInfos, pixiManager);
            const linkedEncodings = getLinkedEncodings(gs);
            console.warn('linkedEncodings', linkedEncodings);
            const trackDefs = createTrackDefs(trackInfos, theme);
            console.warn('trackDefs', trackDefs);
            renderTrackDefs(trackDefs, linkedEncodings, pixiManager);
        };

        // Compile the spec
        compile(spec, callback, [], getTheme('light'), { containerSize: { width: width, height: height } });
    }, []);

    return <div id="plot" style={{ width: width, height: height }}></div>;
}
