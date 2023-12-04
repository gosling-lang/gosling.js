import { type Page, type Locator } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';

export function delay(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

/**
 * Compares two PNG files and returns true if they are the same.
 */
export function isPngSame(newImg: Buffer, oldImg: Buffer) {
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
 * Make sure to use context.grantPermissions(['clipboard-read', 'clipboard-write']); before calling this function.
 */
export async function changeEditorSpec(page: Page, jsonString: string) {
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
export async function checkScreenshotUntilMatches(component: Locator, expectedScreenshotPath: string, timeout: number) {
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