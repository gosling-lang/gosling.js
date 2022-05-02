import { version as goslingVersion } from '../package.json';
const higlassVersion = '1.11';
const reactVersion = '17';
const pixiVersion = '6';

export const getHtmlTemplate = (spec: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Gosling Visualization</title>
    <link rel="stylesheet" href="https://unpkg.com/higlass@${higlassVersion}/dist/hglib.css">
    <script src="https://unpkg.com/react@${reactVersion}/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@${reactVersion}/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/pixi.js@${pixiVersion}/dist/browser/pixi.min.js"></script>
    <script src="https://unpkg.com/higlass@${higlassVersion}/dist/hglib.js"></script>
    <script src="https://unpkg.com/gosling.js@${goslingVersion}/dist/gosling.js"></script>
    <style>html, body, #gosling-container { width: 100%; height: 100% }</style>
</head>
<body>
    <div id="gosling-container"/>
    <script>
    gosling.embed(document.getElementById('gosling-container'), ${spec})
    </script>
</body>
</html>
`;
