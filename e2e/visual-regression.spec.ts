import { test, expect } from '@playwright/test';

import { JsonExampleSpecs } from '../editor/example/json-spec';
import { changeEditorSpec } from './utils';

test.beforeEach(async ({ page, context }) => {
    // Enable clipboard permissions. This is needed to copy the spec to the clipboard in the chromium browser.
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width: 2000, height: 2000 });
    await page.goto('/');
    
});

// test('testing', async ({ page }, testInfo) => {
//     test.setTimeout(60000); // 60 seconds

//     let spec = JSON.stringify(JsonExampleSpecs.EX_SPEC_ALIGNMENT_CHART);
//     // spec = spec.replace(/\\/g, '\\\\').replace(/"/g, '\\"'); // Replace backslashes and double quotes
//     await changeEditorSpec(page, spec);
//     await page.waitForTimeout(10000);
//     const gosComponent = page.getByLabel('Gosling visualization');

//     // Uncomment this to see the screenshot of the component in the report
//     const screenshot = await gosComponent.screenshot();
//     await testInfo.attach('gosComponentScreenshot', {
//         body: screenshot,
//         contentType: 'image/png'
//     });
// });

// test('Image all', async ({ page }, testInfo) => {
//     test.setTimeout(100000); // 60 seconds

//     const specs = Object.entries(JsonExampleSpecs);

//     for (const specInfo of specs) {
//         const [name, jsonSpec] = specInfo;
//         let spec = JSON.stringify(jsonSpec);
//         await changeEditorSpec(page, spec);
//         await page.waitForTimeout(5000);
//         const gosComponent = page.getByLabel('Gosling visualization');

//         // Uncomment this to see the screenshot of the component in the report
//         const screenshot = await gosComponent.screenshot();
//         await testInfo.attach(`${name}_screenshot`, {
//             body: screenshot,
//             contentType: 'image/png'
//         });
//     }
// });

Object.entries(JsonExampleSpecs)
    // .filter(([name]) => name === 'doc_text') // If only want to see the certain example
    .forEach(([name, jsonSpec]) => {
        test(name, async ({ page }, testInfo) => {
            test.setTimeout(60000); // 60 seconds

            let spec = JSON.stringify(jsonSpec);
            await changeEditorSpec(page, spec);
            
            const gosComponent = page.locator('.gosling-component').first();
            // Wait 10 seconds for the visualization to render
            await page.waitForTimeout(20000);
            // Then take a screenshot
            await expect(gosComponent).toHaveScreenshot();
            
            // const screenshot = await gosComponent.screenshot();
            // const diff = getPngDiff(screenshot, screenshot);
            // if (diff) {
            //     await testInfo.attach(`${name}_diff`, {
            //         body: diff,
            //         contentType: 'image/png'
            //     });
            // }

            // await testInfo.attach(`${name}_screenshot`, {
            //     body: screenshot,
            //     contentType: 'image/png'
            // });
        });
    });
