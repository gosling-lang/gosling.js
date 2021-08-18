const path = require("path");
const ThreadsPlugin = require('threads-plugin');

module.exports = {
    output: {
        filename: 'worker.js',
        path: path.resolve(__dirname, 'dist'),
    },
    entry: path.resolve(__dirname, './src/data-fetcher/bam/bam-worker'),
    target: 'webworker',
    plugins: [new ThreadsPlugin()],
}