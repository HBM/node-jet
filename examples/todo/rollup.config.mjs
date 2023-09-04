import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import globals from 'rollup-plugin-node-globals'
import builtins from 'rollup-plugin-node-builtins'

const client = {
  input: 'examples/todo/todo-client.js',
  output: {
    file: 'examples/todo/public/bundle.js',
    format: 'iife',
    globals: { events: 'events' }
  },
  plugins: [
    nodePolyfills(),
    nodeResolve({ preferBuiltins: false, browser: true }),
    commonjs()
  ]
}

const server = {
  input: 'examples/todo/todo-server.js',
  output: {
    file: 'examples/todo/public/server.js',
    format: 'cjs',
    globals: { events: 'events' }
  },
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    commonjs(),
    globals(),
    builtins()
  ]
}

export default [client]
