var browserify = require('browserify')

browserify({
    entries: './index.js',
    extensions: ['.js'],
    ignoreMissing: true,
    detectGlobals: false,
    bare: true,
    debug: false
})