function readPackage(pkg, context) {
  if (pkg.name === 'higlass') {
    // higlass bundles all its dependencies
    pkg.dependencies = {}
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
