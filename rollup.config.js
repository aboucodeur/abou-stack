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
    banner: '#!/usr/bin/env node'
  }
})
