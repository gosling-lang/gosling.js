import puppeteer, { Page, Browser } from 'puppeteer';
import { TEXT, DUMMY_TRACK } from '../example/doc-examples';
import { type GoslingSpec } from '@gosling.schema';
import { examples } from '../example';

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
        args: ['--enable-webgl'] // more consistent rendering of transparent elements
    });
    page = await browser.newPage();
    await page.setContent(generateHTML(), { waitUntil: 'networkidle0' });
    await page.addScriptTag({ path: './dist/gosling.js' });
});

Object.entries(examples)
    .filter(([name, example]) => name === 'RULE')
    .forEach(([name, example]) => {
        test('example', async () => {
            let spec = JSON.stringify(example.spec);
            spec = spec.replaceAll('\\', '\\\\');

            await page.addScriptTag({
                content: `gosling.embed(document.getElementById("vis"), JSON.parse(\`${spec}\`))`
            });
            const component = await page.waitForSelector('.gosling-component');
            await delay(5000);
            await component.screenshot({ path: `editor/tests/${name}.png` });
        });
    });

afterAll(async () => {
    await browser.close();
});
