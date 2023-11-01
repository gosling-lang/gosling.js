import { test, expect, type Page } from '@playwright/test';

import * as fs from 'fs';

const jsonString = fs.readFileSync('./e2e/spec.json', 'utf-8');

function delay(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

test('changes editor spec', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(jsonString => {
        navigator.clipboard.writeText(jsonString);
    }, jsonString);
    await delay(1000);
    await page.mouse.click(200, 200);
    await page.getByRole('textbox', { name: 'Editor content;Press Alt+F1 for Accessibility Options.' }).press('Control+a');
    await page.keyboard.press('Backspace');
    // await delay(1000);
    await page.getByRole('textbox', { name: 'Editor content;Press Alt+F1 for Accessibility Options.' }).press('Meta+v');
    // wait for network to go idle
    await page.waitForLoadState('networkidle');
});
