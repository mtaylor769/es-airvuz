try {
  var log4js = require('log4js');
  var logger = log4js.getLogger('app.persistence.crud.videosViews');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var VideoViewModel = null;
  var database = require('../database/database');

  VideoViewModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.videoView"});
  logger.debug('loaded videoViews model');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var VideoView = function() {};

VideoView.prototype.create = function(params) {
  var videoViewModel = new VideoViewModel(params);
  return videoViewModel.save();
};

VideoView.prototype.findByUserId = function(id) {
  return VideoViewModel.find({ $or: [{userId: id}, {videoOwnerId: id}] }).exec();
};

VideoView.prototype.delete = function(id) {
  return VideoViewModel.findByIdAndRemove(id).exec();
};

module.exports = new VideoView();