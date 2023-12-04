import { test, expect, type Page, Locator } from '@playwright/test';
import { changeEditorSpec, delay, checkScreenshotUntilMatches} from './utils';
import * as fs from 'fs';

test.beforeEach(async ({ page, context }) => {
    // Enable clipboard permissions. This is needed to copy the spec to the clipboard in the chromium browser.
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
});

test('Measure zoom time', async ({ page, browser }, testInfo) => {
    // This test can take a while to run, so we set the timeout to 60 seconds
    test.setTimeout(60000); // 60 seconds

    // Get the spec we want to test and paste it into the editor
    const jsonString = fs.readFileSync('./e2e/assets/example-spec.json', 'utf-8');
    await changeEditorSpec(page, jsonString);
    
    // Wait for the visualization to render 
    const gosComponent = page.getByLabel('Gosling visualization');

    // Uncomment this to see the screenshot of the component in the report
    // const screenshot = await gosComponent.screenshot();
    // await testInfo.attach('gosComponentScreenshot', {
    //     body: screenshot,
    //     contentType: 'image/png',
    // });

    await checkScreenshotUntilMatches(
        gosComponent,
        'e2e/assets/example-spec-expected.png',
        10000
    );

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

    const screenshot = await gosComponent.screenshot();
    await testInfo.attach('gosComponentScreenshot', {
        body: screenshot,
        contentType: 'image/png',
    });

    // Just make sure the zoom time is less than 9 seconds. This is how long it in CI
    expect(zoomTime).toBeLessThan(9000);
});
