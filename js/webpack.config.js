const path = require('path');
const webpack = require('webpack');
const superagent = require('superagent');
 
module.exports = {
  entry: ['babel-polyfill','./src/index.js'],
  output: { path: __dirname, filename: './dist/bundle.js' },
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-2']
        }
      }
    ]
  },
};
