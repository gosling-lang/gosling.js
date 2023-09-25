import puppeteer, { Page, Browser } from 'puppeteer';
import { examples } from '.';
import * as fs from 'fs';

import { beforeAll } from 'vitest';

function delay(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}
// Based on https://github.com/hms-dbmi/chromoscope/blob/master/src/script/gosling-screenshot.js
function html(
    spec: string,
    gosling: string,
    { reactVersion = '16', pixijsVersion = '6', higlassVersion = '1.11' } = {}
) {
    const baseUrl = 'https://unpkg.com';
    return `\
<!DOCTYPE html>
<html>
	<link rel="stylesheet" href="${baseUrl}/higlass@${higlassVersion}/dist/hglib.css">
	<script src="${baseUrl}/react@${reactVersion}/umd/react.production.min.js"></script>
	<script src="${baseUrl}/react-dom@${reactVersion}/umd/react-dom.production.min.js"></script>
	<script src="${baseUrl}/pixi.js@${pixijsVersion}/dist/browser/pixi.min.js"></script>
	<script src="${baseUrl}/higlass@${higlassVersion}/dist/hglib.js"></script>
    <script type="text/javascript">${gosling}</script>
<body>
	<div id="vis"></div>
	<script>
		gosling.embed(document.getElementById("vis"), JSON.parse(\`${spec}\`))
	</script>
</body>
</html>`;
}

function readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

let browser: Browser;
let page: Page;
let currentGosling: string;

beforeAll(async () => {
    currentGosling = await readFile('./dist/gosling.js');
    browser = await puppeteer.launch({
        headless: true,
        devtools: true,
        args: ['--use-gl=swiftshader'] // necessary for canvas to not be blank in the screenshot
    });
    page = await browser.newPage();
    await page.goto('http://gosling-lang.org/docs/'); // must go to a page with a URL
    // await page.setContent(generateHTML(), { waitUntil: 'networkidle0' });
});

/**
 * Loop over all examples and take a screenshot
 */
Object.entries(examples)
    // .filter(([name]) => name === 'ALIGNMENT') // we only want to see the broken example now
    .forEach(([name, example]) => {
        test(
            name,
            async () => {
                let spec = JSON.stringify(example.spec);
                spec = spec.replaceAll('\\', '\\\\');
                await page.setContent(html(spec, currentGosling), { waitUntil: 'networkidle0' });
                await page.addScriptTag({ path: './dist/gosling.js' });
                const component = await page.waitForSelector('.gosling-component');
                await page.waitForNetworkIdle({ idleTime: 2000 });
                await delay(2000); // wait 2 seconds for rendering to complete. TODO: see if we can implement javascript API subscription which fires when rendering is done
                await component!.screenshot({ path: `editor/example/visual-regression-imgs/${name}.png` });
            },
            20000
        );
    });

// afterAll(async () => {
//     await browser.close();
// });
