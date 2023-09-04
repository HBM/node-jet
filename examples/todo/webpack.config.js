'use strict'

import path from 'path'

const serverConfig = {
  target: 'node',
  mode: 'none',
  context: path.resolve('examples', 'todo'),
  entry: './server.ts',
  output: {
    path: path.resolve('examples', 'todo', 'dist'),
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
