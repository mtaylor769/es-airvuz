// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.data.videoPlayerView');

try {
  var BaseView					      = require('./baseView');
  var VideoPlayerEmbedModel 	= require('../model/videoPlayerEmbedModel');
  var Promise						      = require('bluebird');
  var util							      = require('util');

  if(global.NODE_ENV === "production") {
    logger.setLevel("WARN");
  }

  logger.info("import complete");
}
catch(exception) {
  logger.error(" import error:" + exception);
}
// IMPORT: END

var IndexView = function(params) {
  logger.debug("constructor: IN");
  BaseView.apply(this, arguments);

  this.model = new VideoPlayerEmbedModel();
}

util.inherits(IndexView, BaseView);

module.exports = new IndexView({
  cacheTimeout	: 5,
  viewName			: 'app.views.view.videoPlayerEmbed',
  viewPath			: './app/views/view/template/videoPlayerEmbed.dust',
  partials      : []

});