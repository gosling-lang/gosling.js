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
            <div id="plot" style={{ position: 'relative' }}></div>
        </div>
    );
}
/**
 * This is the main function. It takes a Gosling spec and renders it to the container.
 * @param gs
 * @param container
 * @param width
 * @param height
 */
function renderGosling(gs: GoslingSpec, container: HTMLDivElement, width: number, height: number) {
    // Initialize the PixiManager. This will be used to get containers and overlay divs for the plots
    const pixiManager = new PixiManager(width, height, container, () => {});

    // Compile the spec
    const compileResult = compile(gs, [], getTheme('light'), { containerSize: { width: 0, height: 0 } });
    const { trackInfos, gs: processedSpec, theme } = compileResult;

    // Extract all of the linking information from the spec
    const linkedEncodings = getLinkedEncodings(processedSpec);

    // If the spec is responsive, we need to add a resize observer to the container
    const { isResponsiveWidth, isResponsiveHeight } = checkResponsiveSpec(processedSpec);
    if (isResponsiveWidth || isResponsiveHeight) {
        const resizeObserver = new ResizeObserver(
            debounce(entries => {
                const { width, height } = entries[0].contentRect;
                console.warn('Resizing to', width, height);
                // Remove all of the previously drawn overlay divs and tracks
                pixiManager.clearAll();
                const rescaledTracks = rescaleTrackInfos(
                    trackInfos,
                    width,
                    height,
                    isResponsiveWidth,
                    isResponsiveHeight
                );
                const trackDefs = createTrackDefs(rescaledTracks, theme);
                renderTrackDefs(trackDefs, linkedEncodings, pixiManager);
            }, 300)
        );
        resizeObserver.observe(container);
    } else {
        // If the spec is not responsive, we can just render the tracks
        const trackDefs = createTrackDefs(trackInfos, theme);
        renderTrackDefs(trackDefs, linkedEncodings, pixiManager);
        const maxWidth = Math.max(...trackInfos.map(ti => ti.boundingBox.x + ti.boundingBox.width));
        const maxHeight = Math.max(...trackInfos.map(ti => ti.boundingBox.y + ti.boundingBox.height));
        pixiManager.resize(maxWidth, maxHeight);
    }
}

/** Debounces the resize observer */
function debounce(f: (arg0: unknown) => unknown, delay: number) {
    let timer = 0;
    return function (...args: [arg0: unknown]) {
        clearTimeout(timer);
        timer = setTimeout(() => f.apply(this, args), delay);
    };
}

/** Checks whether the input spec has responsive width or height */
function checkResponsiveSpec(spec: GoslingSpec) {
    const isResponsiveWidth =
        (spec.responsiveSize && typeof spec.responsiveSize === 'object' && spec.responsiveSize.width) || false;

    const isResponsiveHeight =
        (spec.responsiveSize && typeof spec.responsiveSize === 'object' && spec.responsiveSize.height) || false;

    return {
        isResponsiveWidth,
        isResponsiveHeight
    };
}

/**
 * This function rescales the bounding boxes of the trackInfos so that they fit within the width and height
 */
function rescaleTrackInfos(
    trackInfos: TrackInfo[],
    width: number,
    height: number,
    isResponsiveWidth: boolean,
    isResponsiveHeight: boolean
): TrackInfo[] {
    if (isResponsiveWidth) {
        const maxWidth = Math.max(...trackInfos.map(ti => ti.boundingBox.x + ti.boundingBox.width));
        const scalingFactor = width / maxWidth;
        trackInfos = trackInfos.map(ti => {
            return {
                ...ti,
                boundingBox: {
                    x: ti.boundingBox.x * scalingFactor,
                    y: ti.boundingBox.y,
                    width: ti.boundingBox.width * scalingFactor,
                    height: ti.boundingBox.height
                }
            };
        });
    }
    if (isResponsiveHeight) {
        const maxHeight = Math.max(...trackInfos.map(ti => ti.boundingBox.y + ti.boundingBox.height));
        const scalingFactor = height / maxHeight;
        trackInfos = trackInfos.map(ti => {
            return {
                ...ti,
                boundingBox: {
                    x: ti.boundingBox.x,
                    y: ti.boundingBox.y * scalingFactor,
                    width: ti.boundingBox.width,
                    height: ti.boundingBox.height * scalingFactor
                }
            };
        });
    }
    return trackInfos;
}
