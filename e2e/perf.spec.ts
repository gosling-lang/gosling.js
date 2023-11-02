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
function isPngSame(newImg: Buffer, oldImgPath: string) {
    const img1 = PNG.sync.read(newImg);
    const img2 = PNG.sync.read(fs.readFileSync(oldImgPath));
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
    await page.evaluate(jsonString => {
        navigator.clipboard.writeText(jsonString);
        
    }, jsonString);
    await page.mouse.click(200, 200);
    await page.getByRole('textbox', { name: 'Editor content;Press Alt+F1 for Accessibility Options.' }).press('Control+KeyA');
    await page.keyboard.press('Backspace');

    await delay(100);
    await page.mouse.click(200, 200, { button: 'right' });
    await delay(100); // this is needed to wait for the context menu to appear
    await page.getByRole('menuitem', { name: 'Paste' }).click();
}

/**
 * This function polls until the screenshot of the given component matches the expected screenshot.
 */
async function pollUntilScreenshotMatchesExpected(
    component: Locator,
    page: Page,
    expectedScreenshotPath: string,
    timeout: number
) {
    let screenshotMatchesExpected = false;
    let timeElapsed = 0;
    while (!screenshotMatchesExpected && timeElapsed < timeout) {
        const screenshot = await component.screenshot();

        screenshotMatchesExpected = isPngSame(screenshot, expectedScreenshotPath);

        if (!screenshotMatchesExpected) {
            await page.waitForTimeout(50); // wait 50ms before polling again
            timeElapsed += 50;
        }
    }
    return timeElapsed;
}

test('changes editor spec', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await changeEditorSpec(page, jsonString);
    // wait for network to go idle
    await page.waitForLoadState('networkidle');
    const gosComponent = page.getByLabel('Gosling visualization');

    const matchTime = await pollUntilScreenshotMatchesExpected(
        gosComponent,
        page,
        'e2e/perf.spec.ts-snapshots/changes-editor-spec-1-chromium-darwin.png',
        10000
    );

    const totalBlockingTime = await page.evaluate(() => {
        return new Promise((resolve) => {
          let totalBlockingTime = 0
          new PerformanceObserver(function (list) {
            const perfEntries = list.getEntries()
            for (const perfEntry of perfEntries) {
              totalBlockingTime += perfEntry.duration - 50
            }
            perfEntries.forEach((entry) => console.log(entry.toJSON()))
            resolve(totalBlockingTime)
          }).observe({ type: 'longtask', buffered: true })
    
          // Resolve promise if there haven't been long tasks
          setTimeout(() => resolve(totalBlockingTime), 5000)
        })
      })
    
    console.log('blocking', parseFloat(totalBlockingTime as string)) // 0
    console.log(matchTime);
    await delay(10000);
    
});
