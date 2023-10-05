import { version as goslingVersion } from '../package.json';
const higlassVersion = '1.12';
const reactVersion = '17';
const pixiVersion = '6';

export const getHtmlTemplate = (spec: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Gosling Visualization</title>
    <link rel="stylesheet" href="https://esm.sh/higlass@${higlassVersion}/dist/hglib.css">

    <script type="importmap">
    {
    "imports": {
        "react": "https://esm.sh/react@${reactVersion}?bundle",
        "react-dom": "https://esm.sh/react-dom@${reactVersion}?bundle",
        "pixi.js": "https://esm.sh/pixi.js@${pixiVersion}?bundle",
        "higlass": "https://esm.sh/higlass@${higlassVersion}?bundle",
        "gosling.js": "https://esm.sh/gosling.js@${goslingVersion}?bundle"
    }
    }
    </script>
    

</head>
<body>
    <div id="gosling-container"></div>
    <script type="module">
        import { embed } from 'gosling.js';
        embed(document.getElementById('gosling-container'), ${spec})
    </script>
</body>
</html>
`;
