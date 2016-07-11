try {
  var Promise = require('bluebird');
  var log4js = require('log4js');
  var logger = log4js.getLogger('app.persistence.crud.comments');
  var ErrorMessage = require('../../utils/errorMessage');
  var ObjectValidationUtil = require('../../utils/objectValidationUtil');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var amazonBucket = require('../../config/amazon.config');
  var SocialModel = null;
  var CommentModel = null;
  var VideoModel = null;
  var database = require('../database/database');
  var SocialCrud = require('./socialMediaAccount')
  var VideoCrud = require('./videos');

  CommentModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.comment"});
  VideoModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.videos"});
  SocialModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.socialMediaAccount"});
  logger.debug('loaded comment crud models');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");

}
catch(exception) {
  logger.error(" import error:" + exception);
}
var Comment = function(){

};
/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
Comment.prototype.getPreCondition = function(params){

  /*
   * @type {string}
   */
  var sourceLocation = params.sourceLocation;
  /*
   * @type {object}
   */
  var preCondition = new ObjectValidationUtil();

  preCondition.setValidation(function(params){
    logger.debug(params);
    var errorMessage              = new ErrorMessage();
    this.data.parentCommentId     = params.parentCommentId || null;
    this.data.comment             = params.comment || null;
    this.data.isVisible           = params.isVisible || true;
    this.data.replyCount          = params.replyCount || 0;
    this.data.replyDepth          = params.replyDepth || 0;
    this.data.videoId             = params.videoId || null;
    this.data.userId              = params.userId || null;

    if(this.data.parentCommentId !== null) {
      this.data.replyDepth = 1;
    }


    if(this.data.comment === null){
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "comment"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.videoId === null){
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "videoId"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.replyDepth && typeof this.data.replyDepth !== 'number'){
      logger.debug(this.data.replyDepth);
      this.errors = errorMessage.getErrorMessage({
        errorId					: "PARAM1020",
        templateParams	: {
          name : "replyDepth"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.replyCount && typeof this.data.replyCount !== 'number'){
      logger.debug('replyCount');
      this.errors = errorMessage.getErrorMessage({
        errorId					: "PARAM1020",
        templateParams	: {
          name : "replyCount"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.isVisible === null){
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "isVisible"
        },
        sourceLocation	: sourceLocation
      })
    }
  if(this.data.userId === null){
    this.errors = errorMessage.getErrorMessage({
      errorId					: "VALIDA1000",
      templateParams	: {
        name : "userId"
      },
      sourceLocation	: sourceLocation
    })
  }
});return(preCondition)

};

/*
 * Create a new CameraType document.
 * @param params 				       {Object}
 * @param params.manufacturer  {string}
 * @param params.model         {string}
 * @param params.isVisible     {boolean}
 * @param params.userId        {ObjectId}
 */

Comment.prototype.create = function(params) {

  var preCondition = this.getPreCondition({sourceLocation: "persistence.crud.comment"});

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
    if(validation.errors !== null) {
      var validationException = new ValidationException({errors: validation.errors});
      reject(validationException);
      return;
    }

    var videoCommentModel = new CommentModel(validation.data);
      logger.debug(videoCommentModel);
    videoCommentModel.save(function(error, videoComment) {
      if(error) {
        logger.debug(error);
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
          errorId					: "PERS1000",
          sourceError			: error,
          sourceLocation	: "persistence.crud.comment.create"
        });

        var persistenceException = new PersistenceException({errors : errorMessage.getErrors() });
        reject(persistenceException);
        return;
      } else {
        return CommentModel.findOne({_id: videoComment._id})
          .populate('userId')
          .lean()
          .exec()
          .then(function(comment) {
            if(comment.userId.profilePicture.indexOf('http') === -1 && comment.userId.profilePicture !== '') {
              comment.userId.profilePicture = amazonBucket.ASSET_URL + 'users/profile-pictures' + comment.userId.profilePicture;
              return comment;
            } else if(comment.userId.profilePicture.indexOf('http') === -1 && comment.userId.profilePicture === '') {
              return SocialCrud.findByUserIdAndProvider(comment.userId._id, 'facebook')
                .then(function(social) {
                  if(social) {
                    comment.userId.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=large';
                  } else {
                    comment.userId.profilePicture = '/client/images/default.png'
                  }
                  return comment;
                })
            } else {
              return comment;
            }
          })
          .then(function (comment) {
            resolve(comment);
          });
      }
    })
  })
  );
};

Comment.prototype.replyIncrement = function(parentCommentId, videoId) {
  CommentModel.findById(parentCommentId).exec()
  .then(function(parentComment) {
    logger.debug('.replyIncrament : parentComment : ' + parentComment);
    if(parentComment !== null) {
      parentComment.replyCount = parentComment.replyCount + 1;
      return parentComment.save();
    } else {
      return {videoId: videoId};
    }
  })
  .then(function(comment) {
    logger.debug('replyIncrament : this is the comment : comment : ' + comment);
    var videoId = comment.videoId;
    logger.debug('replyIncraement : videoId : ' + videoId);
    return VideoCrud.getById(videoId);
  })
  .then(function(video) {
    video.commentCount = video.commentCount + 1;
    return video.save()
  })
  .then(function() {
    return 'success'
  })
  .catch(function(error) {
    logger.error(error);
    return error
  })
};

Comment.prototype.get = function() {
  return CommentModel.find({}).exec();
};


Comment.prototype.getByParentCommentId = function(parentId) {
  return CommentModel.find({parentCommentId: parentId}).sort({commentCreatedDate: -1}).limit(10).populate('userId').lean().exec();
};

Comment.prototype.getParentCommentByVideoId = function(params) {
  var page = params.page || 1;
  var limit = 10;
  var skip = (page - 1) * limit;

  return CommentModel
    .find({videoId: params.videoId, replyDepth: params.replyDepth || 0})
    .sort({commentCreatedDate: -1})
    .skip(skip)
    .limit(limit)
    .populate('userId')
    .lean()
    .exec();
};

Comment.prototype.getByUserAndDate = function(userId, startDate, endDate) {
  return CommentModel.find({userId: userId, commentCreatedDate: {$gte: new Date(startDate), $lte: new Date(endDate)}}).exec()
};

Comment.prototype.getById = function(id) {
  return CommentModel.findById(id).exec();
};

Comment.prototype.getByVideoId = function(id) {
  return CommentModel.find({videoId: id})
};

Comment.prototype.update = function(params) {
  return CommentModel.findByIdAndUpdate(params.id, params.update, { new: true }).exec();
};

Comment.prototype.remove = function(id) {
  return CommentModel.findByIdAndRemove({_id: id}).exec();
};

Comment.prototype.findByUserId = function(id) {
  return CommentModel.find({userId: id}).exec();
};


module.exports = new Comment();