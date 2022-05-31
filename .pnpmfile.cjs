// pnpm lets you hook directly into the installation process via hooks (https://pnpm.io/pnpmfile)
// NOTE: These overrides are _only_ for the Gosling monorepo

module.exports = {
    hooks: {
        /** @param {import('@pnpm/types').PackageManifest} pkg */
        readPackage(pkg) {
            if (pkg.name === 'higlass') {
                // higlass bundles all its dependencies, so we can avoid installing all in Gosling
                pkg.dependencies = {}
                // elimiates peer-dep errors, since higlass is compatiable with react 17 & pixi.js 6
                pkg.peerDependencies = {
                    'react': '^16.0.0 || ^17.0.0',
                    'react-dom': '^16.0.0 || ^17.0.0',
                    'pixi.js': '^5.0.0 || ^6.0.0',
                }
            }
            return pkg;
        }
    }
}
