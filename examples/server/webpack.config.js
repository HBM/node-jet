'use strict'

import path from 'path'

const serverConfig = {
  target: 'node',
  mode: 'none',
  context: path.resolve('examples', 'server'),
  entry: './index.ts',
  output: {
    path: path.resolve('examples', 'server', 'dist'),
    filename: 'server.cjs'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log' // enables logging required for problem matchers
  }
}

export default [serverConfig]
