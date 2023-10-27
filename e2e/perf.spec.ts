import { test, expect, type Page } from '@playwright/test';
import { specExample } from './spec'
import { trace } from 'console';
import * as fs from 'fs';

function delay(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
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

function html(
    spec: string,
    gosling: string,
    { reactVersion = '16', pixijsVersion = '6', higlassVersion = '1.13' } = {}
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



let spec = JSON.stringify(specExample);
spec = spec.replace(/\\/g, '\\\\');

function findFunctionCalls(traceData: any, functionName: string) {
    const functionCalls = traceData.traceEvents.filter((event: any) => {
        if (event.name !== 'ProfileChunk') return false;
        if (!event.args.data?.cpuProfile?.nodes) return false;
        return event.args.data.cpuProfile.nodes.find((node: any) => {
            return node.callFrame.functionName === functionName;
        });
    });
    return functionCalls;
}

function findNetworkCalls(traceData: any, urlRoot: string) {
    const networkCalls = traceData.traceEvents.filter((event: any) => {
        if (event.name !== 'ResourceSendRequest') return false;
        if (!event.args.data?.url) return false;
        return event.args.data.url.startsWith(urlRoot);
    });
    return networkCalls;
}

test('custom js', async ({ browser, page }) => {
    await browser.startTracing(page, { path: './perfTraces.json', screenshots: true });

    const currentGosling = await readFile('./dist/gosling.js');
    // navigate to some random site before we change the HTML so that web workers don't break
    await page.goto('https://esm.sh/gosling.js@0.11.0');

    // show gosling
    await page.setContent(html(spec, currentGosling));
    const component = await page.waitForSelector('.gosling-component', { timeout: 10000 });
    await delay(2000); // wait extra 2 seconds. Should be enough time for any rendering to finish

    const traceBuffer = await browser.stopTracing();
    const traceData = JSON.parse(traceBuffer.toString());
    const profileChunk = findFunctionCalls(traceData, 'receivedTiles');
    const networkChunk = findNetworkCalls(traceData, 'https://resgen.io/api/v1/tiles');

    console.warn(profileChunk);
    console.warn(networkChunk);
});

// test('has title', async ({ page }) => {
//     //Create a new connection to an existing CDP session to enable performance Metrics
//     const session = await page.context().newCDPSession(page);
//     //To tell the CDPsession to record performance metrics.
//     await session.send('Performance.enable');

//     await page.goto('https://www.google.com/');

//     let performanceMetrics = await session.send('Performance.getMetrics');
//     console.log(performanceMetrics.metrics);
//     await expect(page).toHaveTitle(/Google/);
// });

const data = {
    args: {
        data: {
            cpuProfile: {
                nodes: [
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 21,
                            functionName: '',
                            lineNumber: 46123,
                            scriptId: 25,
                            url: 'https://unpkg.com/higlass@1.13/dist/hglib.js'
                        },
                        id: 3107,
                        parent: 1
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 17,
                            functionName: 'receivedTiles',
                            lineNumber: 73184,
                            scriptId: 35,
                            url: 'https://esm.sh/gosling.js@0.11.0'
                        },
                        id: 3108,
                        parent: 3107
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 62,
                            functionName: 'receivedTiles',
                            lineNumber: 50827,
                            scriptId: 25,
                            url: 'https://unpkg.com/higlass@1.13/dist/hglib.js'
                        },
                        id: 3109,
                        parent: 3108
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 90,
                            functionName: 'synchronizeTilesAndGraphics',
                            lineNumber: 50806,
                            scriptId: 25,
                            url: 'https://unpkg.com/higlass@1.13/dist/hglib.js'
                        },
                        id: 3110,
                        parent: 3109
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 72,
                            functionName: 'addMissingGraphics',
                            lineNumber: 50788,
                            scriptId: 25,
                            url: 'https://unpkg.com/higlass@1.13/dist/hglib.js'
                        },
                        id: 3111,
                        parent: 3110
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 12,
                            functionName: 'initTile',
                            lineNumber: 72981,
                            scriptId: 35,
                            url: 'https://esm.sh/gosling.js@0.11.0'
                        },
                        id: 3112,
                        parent: 3111
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 12,
                            functionName: 'drawTile',
                            lineNumber: 72988,
                            scriptId: 35,
                            url: 'https://esm.sh/gosling.js@0.11.0'
                        },
                        id: 3113,
                        parent: 3112
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 25,
                            functionName: 'scale.copy',
                            lineNumber: 3873,
                            scriptId: 25,
                            url: 'https://unpkg.com/higlass@1.13/dist/hglib.js'
                        },
                        id: 3114,
                        parent: 3113
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 17,
                            functionName: 'linear',
                            lineNumber: 3871,
                            scriptId: 25,
                            url: 'https://unpkg.com/higlass@1.13/dist/hglib.js'
                        },
                        id: 3115,
                        parent: 3114
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 21,
                            functionName: 'continuous',
                            lineNumber: 3597,
                            scriptId: 25,
                            url: 'https://unpkg.com/higlass@1.13/dist/hglib.js'
                        },
                        id: 3116,
                        parent: 3115
                    },
                    {
                        callFrame: {
                            codeType: 'JS',
                            columnNumber: 24,
                            functionName: 'transformer$3',
                            lineNumber: 3558,
                            scriptId: 25,
                            url: 'https://unpkg.com/higlass@1.13/dist/hglib.js'
                        },
                        id: 3117,
                        parent: 3116
                    }
                ],
                samples: [2, 3108, 3109, 3117]
            },
            lines: [0, 73186, 50859, 3575],
            timeDeltas: [125, 125, 125, 125]
        }
    },
    cat: 'disabled-by-default-v8.cpu_profiler',
    id: '0x1',
    name: 'ProfileChunk',
    ph: 'P',
    pid: 51916,
    tid: 27651,
    ts: 194653708466,
    tts: 352541
};

const netwwork = {
    args: {
        data: {
            frame: '4326E1CF3D343BEE0EB75BC1C2024E37',
            priority: 'High',
            requestId: '52472.9',
            requestMethod: 'GET',
            stackTrace: [
                {
                    columnNumber: 5,
                    functionName: 'workerGetTiles',
                    lineNumber: 14920,
                    scriptId: '25',
                    url: 'https://unpkg.com/higlass@1.13/dist/hglib.js'
                }
            ],
            url: 'https://resgen.io/api/v1/tiles/?d=UvVPeLHuRDiYA3qwFlm7xQ.2.0&d=UvVPeLHuRDiYA3qwFlm7xQ.2.1&d=UvVPeLHuRDiYA3qwFlm7xQ.2.2&s=GVg0VbF1QHe1cAuv3z1-2g'
        }
    },
    cat: 'devtools.timeline',
    name: 'ResourceSendRequest',
    ph: 'I',
    pid: 52472,
    s: 't',
    tid: 259,
    ts: 197047220656
};
