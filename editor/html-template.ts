import { version as goslingVersion } from '../package.json';
import { version as higlassVersion } from 'higlass/package.json';

export const getHtmlTemplate = (spec: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Gosling Visualization</title>
    <link rel="stylesheet" href="https://esm.sh/higlass@${higlassVersion}/dist/hglib.css">
    
</head>
<body>
    <div id="gosling-container"></div>
    <script type="module">
        import { embed } from 'https://esm.sh/gosling.js@${goslingVersion}?bundle';
        embed(document.getElementById('gosling-container'), ${spec})
    </script>
</body>
</html>
`;
