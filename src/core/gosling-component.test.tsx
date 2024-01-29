import { test, expect } from '@playwright/experimental-ct-react';
import { GoslingComponent } from './gosling-component';
import { spec as JSON_SPEC_VISUAL_ENCODING } from '../../editor/example/spec/visual-encoding';
import { JsonExampleSpecs } from 'editor/example/json-spec';
import React from 'react';

test.use({ viewport: { width: 1000, height: 1000 } });

async function zoom(direction: 'in' | 'out', page: any, steps = 15) {
    const zoomDirection = direction === 'in' ? -1 : 1; // Zoom in or out
    for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, zoomDirection * 50);
    }
}
/**
 * This tests the zooming performance of Gosling. It zooms in and out 15 times and records the time it takes to zoom.
 */
test('Zoom visual encoding', async ({ mount, page }) => {
    test.setTimeout(60000); // 60 seconds
    await mount(<GoslingComponent spec={JSON_SPEC_VISUAL_ENCODING} />);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    const centerTrack = page.locator('.center-track').first();
    await centerTrack.hover();

    // Start timer and zoom in
    const zoomTimes: number[] = [];
    for (let i = 0; i < 15; i++) {
        const startTime = Date.now();
        await zoom('in', page);
        const endTime = Date.now();
        const zoomTime = endTime - startTime;
        zoomTimes.push(zoomTime);
        console.warn(`Zoom time ${i + 1}: ${zoomTime}ms`);
        await zoom('out', page);
    }
    console.warn('Minimum:', Math.min(...zoomTimes));
    expect(Math.min(...zoomTimes)).toBeLessThan(330);

    // const screenshot = await component.screenshot();
    // await testInfo.attach('gosComponentScreenshot', {
    //     body: screenshot,
    //     contentType: 'image/png'
    // });
});

test('Zoom multiple sequence alignment', async ({ mount, page }) => {
    test.setTimeout(60000); // 60 seconds
    await mount(<GoslingComponent spec={JsonExampleSpecs.EX_SPEC_ALIGNMENT_CHART} />);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // Hover over the third track
    const centerTracks = page.locator('.center-track');
    const thirdCenterTrack = centerTracks.nth(2);
    await thirdCenterTrack.hover();

    const zoomTimes: number[] = [];
    for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await zoom('in', page, 5);
        const endTime = Date.now();
        const zoomTime = endTime - startTime;
        zoomTimes.push(zoomTime);
        console.warn(`Zoom time ${i + 1}: ${zoomTime}ms`);
        await zoom('out', page);
    }
    console.warn('Minimum:', Math.min(...zoomTimes));
    expect(Math.min(...zoomTimes)).toBeLessThan(500);
});
