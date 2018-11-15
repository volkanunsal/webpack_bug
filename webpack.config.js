var webpack = require('webpack');
var TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

var config = {
  context: __dirname + '/assets',
  entry: {
    App: './index.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  target: 'web',
  cache: true,
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: 4,
        sourceMap: true,
        cache: true,
      }),
    ],
  },
  mode: 'production',
  plugins: [],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          'cache-loader',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
    ],
  },

  devServer: {
    hot: false,
    compress: true,
    clientLogLevel: 'none',
    historyApiFallback: true,
    quiet: false,
    noInfo: true,
    watchContentBase: false,
    overlay: true,
    watchOptions: {
      aggregateTimeout: 300,
    },
    contentBase: [path.resolve('js')],
    publicPath: `/js/`,
    public: 'localhost:8082',
    headers: {
      'X-Custom-Header': 'yes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, x-id, Content-Length, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    stats: { colors: true },
  },
};

module.exports = config;
