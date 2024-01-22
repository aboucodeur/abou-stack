const rollup = require('rollup')
const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const terser = require('@rollup/plugin-terser')

module.exports = rollup.defineConfig({
  input: 'index.js',
  plugins: [resolve({ preferBuiltins: true }), commonjs(), terser()],
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    // rollup using "use strict"; at top level solve this 
    banner: '#!/usr/bin/env node'
  }
})
