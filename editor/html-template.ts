import { version as _goslingVersion } from '../package.json';
import { dependencies as _goslingDependencies } from '../package.json';

export const getHtmlTemplate = (
    spec: string,
    reactVersion = 18,
    pixiVersion = 6,
    higlassVersion = _goslingDependencies['higlass'],
    goslingVersion = _goslingVersion
) => `
<!DOCTYPE html>
<html>
<head>
    <title>Gosling Visualization</title>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@${reactVersion}",
          "react-dom": "https://esm.sh/react-dom@${reactVersion}",
          "pixi": "https://esm.sh/pixi.js@${pixiVersion}",
          "higlass": "https://esm.sh/higlass@${higlassVersion}?external=react,react-dom,pixi",
          "gosling.js": "https://esm.sh/gosling.js@${goslingVersion}?external=react,react-dom,pixi,higlass"
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
