import { test, expect, type Page, Locator } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';

function delay(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

/**
 * Compares two PNG files and returns true if they are the same.
 */
function isPngSame(newImg: Buffer, oldImg: Buffer) {
    const img1 = PNG.sync.read(newImg);
    const img2 = PNG.sync.read(oldImg);
    // check if the images have the same dimensions
    if (img1.width !== img2.width || img1.height !== img2.height) return false;

    const { width, height } = img1;
    const diff = new PNG({ width, height });
    const pixeldifference = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    // only write to file if there is a difference in the images
    return pixeldifference === 0;
}

/**
 * This function changes the editor spec by pasting the given JSON string.
 */
async function changeEditorSpec(page: Page, jsonString: string) {
    // Copy the spec to the keyboard using the clipboard API
    await page.evaluate(jsonString => {
        navigator.clipboard.writeText(jsonString);
    }, jsonString);
    // click into the text editor
    await page.mouse.click(200, 200);
    // Control+A to select all
    await page
        .getByRole('textbox', { name: 'Editor content;Press Alt+F1 for Accessibility Options.' })
        .press('Control+KeyA');
    // Backspace to delete what is in the text editor
    await page.keyboard.press('Backspace');

    await delay(100);
    // Right click to pull up menu
    await page.mouse.click(200, 200, { button: 'right' });
    await delay(100); // this is needed to wait for the context menu to appear
    // Click on the paste button
    await page.getByRole('menuitem', { name: 'Paste' }).click();
}

/**
 * This function polls until the screenshot of the given component matches the expected screenshot.
 */
async function checkScreenshotUntilMatches(component: Locator, expectedScreenshotPath: string, timeout: number) {
    let screenshotMatchesExpected = false;
    let timeElapsed = 0;
    const compImgBuffer = fs.readFileSync(expectedScreenshotPath);

    while (!screenshotMatchesExpected && timeElapsed < timeout) {
        const screenshot = await component.screenshot();

        screenshotMatchesExpected = isPngSame(screenshot, compImgBuffer);

        if (!screenshotMatchesExpected) {
            await delay(50); // wait 10ms before polling again
            timeElapsed += 50;
        }
    }
}

test.beforeEach(async ({ page, context }) => {
    // Enable clipboard permissions. This is needed to copy the spec to the clipboard in the chromium browser.
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
});

test('Measure zoom time', async ({ page, browser }) => {
    // Get the spec we want to test and paste it into the editor
    const jsonString = fs.readFileSync('./e2e/example-spec.json', 'utf-8');
    await changeEditorSpec(page, jsonString);
    
    // Wait for the visualization to render 
    const gosComponent = page.getByLabel('Gosling visualization');
    await checkScreenshotUntilMatches(
        gosComponent,
        'e2e/perf.spec.ts-snapshots/changes-editor-spec-1-chromium-darwin.png',
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

    // Just make sure the zoom time is less than 3 seconds. In practice it should be much less than this.
    expect(zoomTime).toBeLessThan(3000);
});
