import puppeteer from 'puppeteer';
import { TEXT } from '../example/doc-examples';
import { GoslingSpec } from '@gosling.schema';

function delay(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

function generateHTML(spec: string, { reactVersion = '16', pixijsVersion = '6', higlassVersion = '1.11' } = {}) {
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

/**
 * Takes a screenshot of a particular Gosling spec
 * @param spec
 * @param opts
 */
async function screenshot(gosSpec: GoslingSpec, opts: { path: string }) {
    let spec = JSON.stringify(gosSpec);
    spec = spec.replaceAll('\\', '\\\\');

    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();
    await page.setContent(generateHTML(spec), { waitUntil: 'networkidle0' });
    await page.addScriptTag({ path: './dist/gosling.js' });
    await page.addScriptTag({ content: `gosling.embed(document.getElementById("vis"), JSON.parse(\`${spec}\`))` });
    const component = await page.waitForSelector('.gosling-component');
    await delay(5000);
    await component.screenshot(opts);

    await browser.close();
}

describe('Can take screenshot', () => {
    it('Can take image', async () => {
        // screenshot(GFF_DEMO, { path: './screenshot.png' });
        await screenshot(TEXT, { path: 'editor/tests/browser.png' });
    }, 100000);
});
