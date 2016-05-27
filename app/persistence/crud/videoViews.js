try {
  var Promise = require('bluebird');
  var log4js = require('log4js');
  var logger = log4js.getLogger('app.persistence.crud.videosViews');
  var ErrorMessage = require('../../utils/errorMessage');
  var ObjectValidationUtil = require('../../utils/objectValidationUtil');
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

var VideoView = function() {

};

VideoView.prototype.create = function(params) {
  return(new Promise(function(resolve, reject) {
    var videoViewModel = new VideoViewModel(params);
    videoViewModel.save(function(error, videoView) {
        resolve(videoView);
    })
  })
  )
};

module.exports = new VideoView();