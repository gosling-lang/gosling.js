import puppeteer, { Page, Browser } from 'puppeteer';
import { examples } from '.';

import { beforeAll } from 'vitest';

function delay(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

function generateHTML({ reactVersion = '16', pixijsVersion = '6', higlassVersion = '1.11' } = {}) {
    const baseUrl = 'https://unpkg.com';
    return `\
<!DOCTYPE html>
<html>
	<link rel="stylesheet" href="${baseUrl}/higlass@${higlassVersion}/dist/hglib.css">
	<script src="${baseUrl}/react@${reactVersion}/umd/react.production.min.js"></script>
	<script src="${baseUrl}/react-dom@${reactVersion}/umd/react-dom.production.min.js"></script>
	<script src="${baseUrl}/pixi.js@${pixijsVersion}/dist/browser/pixi.min.js"></script>
	<script src="${baseUrl}/higlass@${higlassVersion}/dist/hglib.js"></script>
<body>
	<div id="vis"></div>
</body>
</html>`;
}

let browser: Browser;
let page: Page;

beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: false,
        // devtools: true,
        args: ['--enable-webgl'] // necessary for canvas to not be blank in the screenshot
    });
    page = await browser.newPage();
    await page.goto('http://gosling-lang.org/docs/'); // must go to a page with a URL
    await page.setContent(generateHTML(), { waitUntil: 'networkidle0' });
    await page.addScriptTag({ path: './dist/gosling.js' });
});

/**
 * Loop over all examples and take a screenshot
 */
Object.entries(examples)
    .filter(([name]) => name === 'doc_vcf_indels') // we only want to see the broken example now
    .forEach(([name, example]) => {
        test(name, async () => {
            let spec = JSON.stringify(example.spec);
            spec = spec.replaceAll('\\', '\\\\');
            await page.addScriptTag({
                content: `gosling.embed(document.getElementById("vis"), JSON.parse(\`${spec}\`))`
            });
            const component = await page.waitForSelector('.gosling-component');
            await page.waitForNetworkIdle();
            await delay(2000); // wait 2 seconds for rendering to complete. TODO: see if we can implement javascript API subscription which fires when rendering is done
            await component!.screenshot({ path: `editor/example/visual-regression-imgs/${name}.png` });
        });
    });

// afterAll(async () => {
//     await browser.close();
// });
