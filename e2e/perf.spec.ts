import { test, expect, type Page, Locator } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';

const jsonString = fs.readFileSync('./e2e/spec.json', 'utf-8');

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

async function getTotalBlockingTime(page: Page) {
    const blockingTime = await page.evaluate(() => {
        return new Promise(resolve => {
            let totalBlockingTime = 0;
            new PerformanceObserver(function (list) {
                const perfEntries = list.getEntries();

                perfEntries.forEach(perfEntry => {
                    totalBlockingTime += perfEntry.duration - 50;
                });

                console.log(JSON.stringify(perfEntries));

                resolve(totalBlockingTime);
            }).observe({ type: 'longtask', buffered: true });

            // Resolve promise if there haven't been long tasks
            setTimeout(() => resolve(totalBlockingTime), 5000);
        });
    });
    return blockingTime;
}

test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    // await page.waitForLoadState('networkidle');
});

test('changes editor spec', async ({ page, browser }) => {
    // await browser.startTracing(page, { path: './perfTraces.json', screenshots: false })
    await changeEditorSpec(page, jsonString);
    // wait for network to go idle
    // await page.waitForLoadState('networkidle');
    const gosComponent = page.getByLabel('Gosling visualization');

    console.time('Time until screenshot matches expected');
    await checkScreenshotUntilMatches(
        gosComponent,
        'e2e/perf.spec.ts-snapshots/changes-editor-spec-1-chromium-darwin.png',
        10000
    );
    console.timeEnd('Time until screenshot matches expected');

    await delay(1000);
    const centerTrack: Locator = page.locator('.center-track').first();
    await centerTrack.hover();
    
    for (let i = 0; i < 20; i++) {
        await page.mouse.wheel(0, -100);
    }

    await delay(1000);
    const blockingTime = await getTotalBlockingTime(page);
    console.log(blockingTime);
    // await browser.stopTracing()
});
