import { test, expect, type Page, Locator } from '@playwright/test';
import { changeEditorSpec, delay, checkScreenshotUntilMatches} from './utils';
import * as fs from 'fs';

test.beforeEach(async ({ page, context }) => {
    // Enable clipboard permissions. This is needed to copy the spec to the clipboard in the chromium browser.
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
});

test('Measure zoom time', async ({ page, browser }) => {
    // Get the spec we want to test and paste it into the editor
    const jsonString = fs.readFileSync('./e2e/assets/example-spec.json', 'utf-8');
    await changeEditorSpec(page, jsonString);
    
    // Wait for the visualization to render 
    await delay(5000);
    // Optionally, wait for the visualization to render by checking the screenshot. However, this does not work in CI
    // const gosComponent = page.getByLabel('Gosling visualization');
    // await checkScreenshotUntilMatches(
    //     gosComponent,
    //     'e2e/assets/example-spec-expected.png',
    //     10000
    // );

    // Hover over a track
    await delay(1000);
    const centerTrack: Locator = page.locator('.center-track').first();
    await centerTrack.hover();
    
    // Start timer and zoom in
    const startTime =  Date.now();
    const zoomSteps = 15; // Trigger zoomSteps number of zooms
    for (let i = 0; i < zoomSteps; i++) {
        await page.mouse.wheel(0, -1);
    }
    const endTime = Date.now();
    const zoomTime = endTime - startTime;
    console.log(`Zoom time: ${zoomTime}ms`);

    // Just make sure the zoom time is less than 3 seconds. In practice it should be much less than this.
    expect(zoomTime).toBeLessThan(3000);
});
