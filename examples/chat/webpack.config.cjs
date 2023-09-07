'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')


const serverConfig = {
  target: 'node',
  mode: 'none',
  context: path.resolve('examples', 'chat','server'),
  entry: './index.ts',
  output: {
    path: path.resolve('examples', 'chat', 'dist'),
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
  devServer: {
    devMiddleware: {
      writeToDisk: true,
    }
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log' // enables logging required for problem matchers
  }
}
const clientConfig = {
  target: 'web',
  mode: 'none',
  context: path.resolve('examples', 'chat','client'),
  entry: './index.ts',
  output: {
    path: path.resolve('examples', 'chat', 'dist'),
    filename: 'client.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader']
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader','css-loader','postcss-loader']
      }

    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: { events: require.resolve('events/') },
  },
  devtool: 'nosources-source-map',
  plugins:[ new HtmlWebpackPlugin({
    template: "index.html"
  }),
]
}

module.exports = [clientConfig, serverConfig]
