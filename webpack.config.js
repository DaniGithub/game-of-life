let webpack = require('webpack'),
    path = require('path'),
    BUILD_DIR = path.resolve(__dirname, 'public'),
    APP_DIR = path.resolve(__dirname, 'app');

var config = {
  entry: [APP_DIR + '/index.js'],
  devtool: 'source-map',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
    publicPath: '/'
  },
  devServer: {
    contentBase: 'public'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        include: APP_DIR,
        loader: 'style-loader!css-loader?sourceMap!sass-loader?sourceMap'
      }      
    ]
  }
};

module.exports = config;