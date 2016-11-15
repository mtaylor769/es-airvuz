// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.videoPlayerView');

try {
  var BaseView					= require('./baseView');
  var VideoPlayerModel	= require('../model/videoPlayerModel');
  var util							= require('util');

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

  this.model = new VideoPlayerModel();
};

util.inherits(IndexView, BaseView);

module.exports = new IndexView({
  cacheTimeout	: 0,
  viewName			: 'app.views.view.videoPlayerPartial',
  viewPath			: './app/views/view/partial/video-player.dust',
  partials      : [
    {
      partialName: 'client.templates.videoPlayer.videoPlayerTemplate',
      partialPath: './client/templates/videoPlayer/videoPlayerTemplate.dust'
    }
  ]
});