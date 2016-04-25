try {
  var Promise = require('bluebird');
  var _ = require('lodash');
  var log4js = require('log4js');
  var logger = log4js.getLogger('persistance.crud.Videos');
  var ErrorMessage = require('../../utils/errorMessage');
  var ObjectValidationUtil = require('../../utils/objectValidationUtil');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var VideoLikeModel = null;
  var database = require('../database/database');
  var mongoose = require('mongoose');

  VideoLikeModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.videoLike"});
  logger.debug('loaded video like model');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var VideoLike = function () {

};

VideoLike.prototype.create = function(params) {
  var videoId = mongoose.Types.ObjectId(params.videoId);
  params.videoIdCheck = videoId;
  return(new Promise(function(resolve, reject) {
    VideoLikeModel.find({userId: params.userId}).exec()
      .then(function(likes) {
        var likeCheck = _.find(likes, {'videoId' : params.videoIdCheck });
        console.log(likeCheck);
        if(!likeCheck) {
          var videoLikeModel = new VideoLikeModel(params);
          videoLikeModel.save(function(error, videoLike){
            resolve(videoLike);
          });
        } else {
          reject('already liked');
        }
      })
    })
  )
};

VideoLike.prototype.videoLikeCheck = function(params) {
  var videoId = mongoose.Types.ObjectId(params.videoId);
  params.videoIdCheck = videoId;
};

VideoLike.prototype.delete = function(id) {
  return VideoLikeModel.findByIdAndRemove(id).exec();
};
module.exports = new VideoLike();