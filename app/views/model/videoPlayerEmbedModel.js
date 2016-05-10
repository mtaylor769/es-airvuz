// IMPORT: BEGIN
var namespace				= 'app.views.model.videoPlayerModel';
var log4js					= require('log4js');
var logger					= log4js.getLogger(namespace);


try {
  var BaseModel	    = require('./baseModel');
  var EventTrackingCrud			= require('../../persistence/crud/events/eventTracking');
  var Promise		    = require('bluebird');
  var util			    = require('util');
  var videoCrud     = require('../../persistence/crud/videos');
  var config				= require('../../../config/config')[process.env.NODE_ENV || 'development'];

  if(global.NODE_ENV === "production") {
    logger.setLevel("WARN");
  }

  logger.info("import complete");
}
catch(exception) {
  logger.error(" import error:" + exception);
}
// IMPORT: END

var VideoPlayerEmbedModel = function(params) {

  BaseModel.apply(this, arguments);
};

util.inherits(VideoPlayerEmbedModel, BaseModel);

VideoPlayerEmbedModel.prototype.getData = function(params) {

  var videoId         = params.request.params.id;
  return videoCrud.getById(videoId)
    .then(function(video) {

      params.data													    = video;
      params.data.facebookAppId 					    = config.facebook.clientID;
      params.data.videoPlayerEmbed					  = {};
      params.data.videoPlayerEmbed.title		  = "Video Player";
      params.data.videoPlayerEmbed.viewName	  = "Video Player";
      return params;
    });
};

module.exports = VideoPlayerEmbedModel;