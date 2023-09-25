import puppeteer, { Page, Browser } from 'puppeteer';
import { examples } from '../../editor/example';
import * as fs from 'fs';
import { beforeAll } from 'vitest';

import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

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

/**
 * Compares two PNG files and writes the difference to a third file if a difference is found
 */
function comparePNG(path1: string, path2: string, diffPath: string) {
    const img1 = PNG.sync.read(fs.readFileSync(path1));
    const img2 = PNG.sync.read(fs.readFileSync(path2));
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    const pixeldifference = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    // only write to file if there is a difference in the images
    if (pixeldifference > 0) {
        fs.writeFileSync(diffPath, PNG.sync.write(diff));
    }
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

console.warn('Expect this to take about 10 minutes to run, depending on your internet speed');

/**
 * Loop over all examples and take a screenshot
 */
Object.entries(examples)
    // .filter(([name]) => name === 'doc_text') // we only want to see the broken example now
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
                await component!.screenshot({ path: `./img/visual-regression/new-screenshots/${name}.png` });
                comparePNG(
                    `img/visual-regression/screenshots/${name}.png`,
                    `img/visual-regression/new-screenshots/${name}.png`,
                    `img/visual-regression/diffs/${name}.png`
                );
            },
            20000
        );
    });

// afterAll(async () => {
//     await browser.close();
// });
