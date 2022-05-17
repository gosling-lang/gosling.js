function readPackage(pkg, context) {
  if (pkg.name === 'higlass') {
    // higlass bundles all its dependencies
    pkg.dependencies = {}
    pkg.peerDependencies = {
        'react': '^16.0.0 || ^17.0.0',
        'react-dom': '^16.0.0 || ^17.0.0',
        'pixi.js': '^5.0.0 || ^6.0.0',
    }
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
