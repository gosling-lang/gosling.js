import React, { useState, useEffect, useMemo } from 'react';
import { PixiManager } from '@pixi-manager';

import { compile } from '../src/compiler/compile';
import { getTheme } from '../src/core/utils/theme';

import type { HiGlassSpec } from '@gosling-lang/higlass-schema';
import { createTrackDefs } from './track-def/main';
import { renderTrackDefs } from './renderer/main';
import type { TrackInfo } from 'src/compiler/bounding-box';
import type { GoslingSpec } from 'gosling.js';
import { getLinkedEncodings } from './linking/linkedEncoding';

interface GoslingComponentProps {
    spec: GoslingSpec | undefined;
    width: number;
    height: number;
}
export function GoslingComponent({ spec, width, height }: GoslingComponentProps) {
    const [fps, setFps] = useState(120);

    useEffect(() => {
        if (!spec) return;

        const plotElement = document.getElementById('plot') as HTMLDivElement;
        plotElement.innerHTML = '';
        renderGosling(spec, plotElement, width, height);
    }, [spec]);

    return (
        <div style={{ padding: 50, backgroundColor: 'white' }}>
            <div id="plot" style={{ width: '100%', height: '100%', position: 'relative' }}></div>
        </div>
    );
}

function renderGosling(gs: GoslingSpec, container: HTMLDivElement, width: number, height: number) {
    // Initialize the PixiManager. This will be used to get containers and overlay divs for the plots
    const pixiManager = new PixiManager(width, height, container, () => {});

    // Compile the spec
    const compileResult = compile(gs, [], getTheme('light'), { containerSize: { width: 0, height: 0 } });
    const { trackInfos, gs: processedSpec, theme } = compileResult;

    // Extract all of the linking information from the spec
    const linkedEncodings = getLinkedEncodings(processedSpec);
    const resizeObserver = new ResizeObserver(
        debounce(entries => {
            const { width, height } = entries[0].contentRect;
            // Remove all of the previously drawn overlay divs and tracks
            pixiManager.clearAll();
            const rescaledTracks = rescaleTrackInfos(trackInfos, width, height);
            const trackDefs = createTrackDefs(rescaledTracks, theme);
            renderTrackDefs(trackDefs, linkedEncodings, pixiManager);
            // pixiManager.resize(width, height);
        }, 300)
    );
    resizeObserver.observe(container);
}

/** Debounces the resize observer */
function debounce(f: (arg0: unknown) => unknown, delay: number) {
    let timer = 0;
    return function (...args: [arg0: unknown]) {
        clearTimeout(timer);
        timer = setTimeout(() => f.apply(this, args), delay);
    };
}

/**
 * This function rescales the bounding boxes of the trackInfos so that they fit within the width and height
 */
function rescaleTrackInfos(trackInfos: TrackInfo[], width: number, height: number): TrackInfo[] {
    const maxWidth = Math.max(...trackInfos.map(ti => ti.boundingBox.x + ti.boundingBox.width));
    const scalingFactor = width / maxWidth;
    const scaledTrackInfos = trackInfos.map(ti => {
        return {
            ...ti,
            boundingBox: {
                x: ti.boundingBox.x * scalingFactor,
                y: ti.boundingBox.y * scalingFactor,
                width: ti.boundingBox.width * scalingFactor,
                height: ti.boundingBox.height * scalingFactor
            }
        };
    });
    return scaledTrackInfos;
}
