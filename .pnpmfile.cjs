// pnpm lets you hook directly into the installation process via hooks (https://pnpm.io/pnpmfile)
// NOTE: These overrides are _only_ for the Gosling monorepo

module.exports = {
    hooks: {
        // NOTE: We only override pkg metadata for specific versions.
        // If we bump a version, we will need to modify this script.
        readPackage(pkg) {
            if (pkg.name === 'higlass' && pkg.version === '1.11.11') {
                // higlass bundles all its dependencies, so we can avoid installing all in Gosling
                pkg.dependencies = {}
                // elimiates peer-dep errors, since higlass is compatiable with react 17 & pixi.js 6
                pkg.peerDependencies = {
                    'react': '^16.0.0 || ^17.0.0',
                    'react-dom': '^16.0.0 || ^17.0.0',
                    'pixi.js': '^5.0.0 || ^6.0.0',
                }
            }
            if (pkg.name === 'react-monaco-editor' && pkg.version === '0.45.0') {
                // this package is totally fine with react 16
                pkg.peerDependencies = {
                    ...pkg.peerDependencies,
                    'react': '^16.0.0 || ^17.0.0',
                    '@types/react': '^16.0.0 || ^17.0.0',
                }
            }
            return pkg;
        }
    }
}
