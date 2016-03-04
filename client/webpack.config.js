'use strict';

//   _____            _                                      _
//  | ____|_ ____   ___)_ __ ___  _ __  _ __ ___   ___ _ __ | |_
//  |  _| | '_ \ \ / / | '__/ _ \| '_ \| '_ ` _ \ / _ \ '_ \| __|
//  | |___| | | \ V /| | | | (_) | | | | | | | | |  __/ | | | |_
//  |_____|_| |_|\_/ |_|_|  \___/|_| |_|_| |_| |_|\___|_| |_|\__|
//

var NODE_ENV    = process.env.NODE_ENV || 'development';
var IS_DEVELOPMENT = NODE_ENV === 'development';
var IS_PRODUCTION  = NODE_ENV === 'production';
console.log(IS_DEVELOPMENT);

//   _     _ _                    _
//  | |   (_) |__  _ __ __ _ _ __(_) ___ ___
//  | |   | | '_ \| '__/ _` | '__| |/ _ \ __|
//  | |___| | |_) | | | (_| | |  | |  __\__ \
//  |_____|_|_.__/|_|  \__,_|_|  |_|\___|___/
//

var path                  = require ( 'path' );
var webpack               = require ( 'webpack' );
var WebpackManifestPlugin = require ( 'webpack-manifest-plugin' );
var WebpackMd5Hash        = require ( 'webpack-md5-hash' );
var ExtractTextPlugin     = require ( 'extract-text-webpack-plugin' );

// PostCSS
var cssImport    = require ( 'postcss-import' );
var simpleVars   = require ( 'postcss-simple-vars' );
var rucksack     = require ( 'rucksack-css' );
var lost         = require ( 'lost' );
var autoprefixer = require ( 'autoprefixer' );
var mqpacker     = require ( 'css-mqpacker' );
var cssnano      = require ( 'cssnano' );

//    ____             __ _                       _   _
//   / ___|___  _ __  / _(_) __ _ _   _ _ __ __ _| |_(_) ___  _ __
//  | |   / _ \| '_ \| |_| |/ _` | | | | '__/ _` | __| |/ _ \| '_ \
//  | |___ (_) | | | |  _| | (_| | |_| | | | (_| | |_| | (_) | | | |
//   \____\___/|_| |_|_| |_|\__, |\__,_|_|  \__,_|\__|_|\___/|_| |_|
//                          |___/
//
// http://webpack.github.io/docs/configuration.html

var config = {};

// Devtool
config.devtool = 'source-map';
config.watch   = IS_DEVELOPMENT;

// Load files
config.context      = path.resolve ( __dirname );
config.entry        = {};
config.entry.vendor = [
  'lodash'
];
config.entry.airvuz = './scripts';

// Output
config.output = {};

config.output.path          = path.resolve ( __dirname, '../public/' );
config.output.filename      = IS_PRODUCTION ? '[name].[chunkhash].js' : '[name].bundle.js';
config.output.chunkFilename = IS_PRODUCTION ? 'airvuz.[name].[chunkhash].js' : 'airvuz.[name].chunk.js';

// Loaders
config.module = { loaders: [] };

// CSS
config.module.loaders.push ( {
  test:    /\.css$/,
  include: [
    path.resolve ( __dirname, 'styles' )
  ],
  loader:  ExtractTextPlugin.extract ( 'style', 'css?-minimize!postcss' )
} );

// PostCSS Plugins
config.postcss = function ( webpack ) {

  var plugins = [];

  plugins.push ( cssImport ( {
    addDependencyTo: webpack
  } ) );

  plugins.push ( simpleVars );

  plugins.push ( lost );

  plugins.push ( rucksack );

  plugins.push ( autoprefixer );

  if ( IS_PRODUCTION ) {
    plugins.push ( mqpacker );

    plugins.push ( cssnano );
  }

  return plugins;
};

// Plugins
config.plugins = [];

config.plugins.push ( new WebpackManifestPlugin ( ) );

// Definitions
config.plugins.push ( new webpack.DefinePlugin ( {
  NODE_ENV:       NODE_ENV,
  IS_PRODUCTION:  IS_PRODUCTION,
  IS_DEVELOPMENT: IS_DEVELOPMENT,
  IS_NODE:        false
} ) );

// Common chunks
config.plugins.push ( new webpack.optimize.CommonsChunkPlugin ( {
  name:      "vendor",
  minChunks: Infinity
} ) );

// Make CSS stylesheets
config.plugins.push ( new ExtractTextPlugin ( IS_PRODUCTION ? '[name].[chunkhash].css' : '[name].css' ) );

if ( IS_PRODUCTION ) {
  config.plugins.push ( new webpack.optimize.UglifyJsPlugin ( {
    compress: {
      warnings: false
    }
  } ) );

  config.plugins.push ( new WebpackMd5Hash () );
}

module.exports = config;