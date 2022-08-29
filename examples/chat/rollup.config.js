import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  input: 'chat-client.js',
  output: {
    file: 'public/bundle.js',
    format: 'iife',
    globals: { events: 'events' }
  },
  plugins: [
    nodePolyfills(),
    nodeResolve({ preferBuiltins:false, browser:true }),
    commonjs(),
    
    
  ]
};