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
  var VideoModel = null;
  var database = require('../database/database');
  var mongoose = require('mongoose');

  VideoLikeModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.videoLike"});
  logger.debug('loaded video like model');

  VideoModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.videos"});
  logger.debug('loaded video model');

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
  return(new Promise(function(resolve, reject) {
    VideoLikeModel.find({videoId: params.videoId, userId: params.userId}).exec()
      .then(function (like) {
        if (like.length === 0) {
          return VideoModel.findById(params.videoId).exec()
            .then(function (video) {
              video.likeCount = video.likeCount + 1;
              return video.save()
            })
            .then(function (video) {
              var videLikeModel = new VideoLikeModel(params);
              videLikeModel.save(function (error, videoLike) {
                resolve(videoLike);
              })
            })
        } else {
          return VideoModel.findById(params.videoId).exec()
            .then(function (video) {
              video.likeCount = video.likeCount - 1;
              return video.save()
                .then(function (video) {
                  reject({likeId: like[0]._id});
                })
            })
        }
      })
  })
  )
};

VideoLike.prototype.delete = function(id) {
  return VideoLikeModel.findByIdAndRemove(id).exec()
};

VideoLike.prototype.likeCount = function(params) {
  return(new Promise(function(resolve, reject) {
    VideoModel.findById(params.videoId).exec()
      .then(function(video) {
        video.likeCount = video.likeCount + 1;
        video.save(function(error, video) {
          resolve(video);
        })
      })
  })
  )
};

VideoLike.prototype.videoLikeCheck = function(params) {
  console.log('this is the Params : ');
  console.log(params);
  var videoId = mongoose.Types.ObjectId(params.video);
  params.videoIdCheck = videoId;
  return VideoLikeModel.find({userId: params.user})
  .then(function(likes) {
    console.log('***********************');
    console.log(likes);
    console.log('***********************');
    var likeCheck = _.find(likes, {'videoId' : params.videoIdCheck });
    console.log('this is the likeCheck : ' + likeCheck)
  })
};

VideoLike.prototype.delete = function(id) {
  return VideoLikeModel.findByIdAndRemove(id).exec();
};
module.exports = new VideoLike();