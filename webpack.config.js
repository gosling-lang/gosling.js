const path = require("path");
const webpack = require("webpack");
const ThreadsPlugin = require('threads-plugin');

module.exports = (env, argv) => {
  const config = {
    entry: { 
      main: './src/index.ts'
    },
    output: {
      filename: "gosling.js",
      path: path.resolve(__dirname, "dist"),
      libraryTarget: 'umd',
      umdNamedDefine: true,
      library: 'gosling'
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    mode: argv.mode === 'production' ? 'production' : 'development',
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [{
              loader: 'ts-loader',
          }],
          exclude: /node_modules/,
        }
      ],
    },
    externals: {
      "pixi.js": {
        commonjs: "pixi.js",
        commonjs2: "pixi.js",
        amd: "pixi.js",
        root: "PIXI",
      },
      react: {
        commonjs: "react",
        commonjs2: "react",
        amd: "react",
        root: "React",
      },
      "react-dom": {
        commonjs: "react-dom",
        commonjs2: "react-dom",
        amd: "react-dom",
        root: "ReactDOM",
      },
    },
    plugins: [
      new ThreadsPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      })
    ]
  };
  return config;
};