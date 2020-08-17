import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss';
import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from '@rollup/plugin-typescript';
import html from '@rollup/plugin-html';
import serve from 'rollup-plugin-serve';
import replace from '@rollup/plugin-replace';
import babel from 'rollup-plugin-babel';
import liverload from 'rollup-plugin-livereload';

export default {
    input: 'src/index.tsx',
    output: {
        dir: 'build',
        sourcemap: true,
        format: 'umd',
        name: 'GeminiEditor',
        globals: {
            higlass: 'hglib'
        }
    },
    plugins: [
        nodeResolve({browser: true}),
        typescript({tsconfig: "src/tsconfig.json"}), 
        scss({output: "build/index.css"}),
        commonjs({
            include: [
              'node_modules/**',
            ]
        }),
        babel({
            runtimeHelpers: true,
            exclude: 'node_modules/**'
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
        }),
        json(),
        serve({
            port: 3000,
            contentBase: 'build'
        }),
        liverload('build'),
        sourcemaps(),
        html({
            template: () => {
                return (
`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <link rel="icon" href="./favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="lightgray" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://unpkg.com/higlass@1.9.3/dist/hglib.css">
    <link rel="stylesheet" href="./index.css">
    <title>Gemini Editor</title>
</head>

<body>
    <div id="root"></div>
    <script crossorigin type="text/javascript" src="./index.js"></script>
    <script crossorigin type="text/javascript" src="https://unpkg.com/react@16/umd/react.development.js"></script>
    <script crossorigin type="text/javascript" src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
    <script crossorigin type="text/javascript" src="https://unpkg.com/pixi.js@5/dist/pixi.js"></script>
    <script crossorigin type="text/javascript" src="https://unpkg.com/react-bootstrap@0.32.1/dist/react-bootstrap.js"></script>
    <script crossorigin type="text/javascript" src="https://unpkg.com/higlass@1.9.3/dist/hglib.js"></script>
</body>

</html>`)
            }
        })
    ]
};