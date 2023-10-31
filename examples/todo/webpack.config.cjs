'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const serverConfig = {
  target: 'node',
  mode: 'none',
  context: path.resolve('./', 'examples', 'todo', 'server'),
  entry: './index.ts',
  output: {
    path: path.resolve('./', 'examples', 'todo', 'dist'),
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
  devServer: {
    devMiddleware: {
      writeToDisk: true
    }
  },
  infrastructureLogging: {
    level: 'log' // enables logging required for problem matchers
  }
}
const clientConfig = {
  target: 'web',
  mode: 'none',
  context: path.resolve('./', 'examples', 'todo', 'client'),
  entry: './client.ts',
  output: {
    path: path.resolve('./', 'examples', 'todo', 'dist'),
    filename: 'client.js',
    publicPath: '/',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader']
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: { events: require.resolve('events/') }
  },
  devtool: 'nosources-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'TODO',
      template: 'index.html'
    })
  ]
}

module.exports = [serverConfig,clientConfig]
