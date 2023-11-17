import { test } from '@playwright/test';

import { JsonExampleSpecs } from '../editor/example/json-spec';
import { changeEditorSpec, delay, isPngSame } from './utils';

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
    // .filter(([name]) => name === 'doc_text') // we only want to see the broken example now
    .forEach(([name, jsonSpec]) => {
        test(name, async ({ page }, testInfo) => {
            test.setTimeout(60000); // 60 seconds

            let spec = JSON.stringify(jsonSpec);
            await changeEditorSpec(page, spec);
            await page.waitForTimeout(10000);
            const gosComponent = page.locator('.gosling-component').first();

            // Uncomment this to see the screenshot of the component in the report
            const screenshot = await gosComponent.screenshot();
            await testInfo.attach(`${name}_screenshot`, {
                body: screenshot,
                contentType: 'image/png'
            });
        });
    });
