"use strict";
try {
  var log4js                      = require('log4js');
  var logger                      = log4js.getLogger('persistance.crud.CameraType');
  var Promise											= require('bluebird');

  var ErrorMessage								= require('../../utils/errorMessage');
  var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
  var PersistenceException				= require('../../utils/exceptions/PersistenceException');
  var ValidationException					= require('../../utils/exceptions/ValidationException');
  var CommentModel							  = null;
  var database                    = require('../database/database');

  CommentModel                = database.getModelByDotPath({modelDotPath: "app.persistence.model.comment"});
  logger.debug('loaded comment model');
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
    var errorMessage              = new ErrorMessage();
    this.data.parentCommentId     = params.parentCommentId || null;
    this.data.comment             = params.comment || null;
    this.data.isVisible           = params.isVisible || null;
    this.data.replyCount          = params.replyCount || 0;
    this.data.replyDepth          = params.replyDepth || 0;
    this.data.videoId             = params.videoId || null;
    this.data.userId              = params.userId || null;


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

    if(params.replyDepth && typeof params.replyDepth !== "number"){
      this.errors = errorMessage.getErrorMessage({
        errorId					: "PARAM1020",
        templateParams	: {
          name : "replyDepth"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.replyCount && typeof this.data.replyCount !== 'number'){
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
    videoCommentModel.save(function(error, videoComment) {
      if(error) {
        console.log(error);
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
        resolve(videoComment);
        return;
      }
    })


  })
  );
};

Comment.prototype.replyIncrament = function(videoId) {
  CommentModel.find({videoId: videoId, parentCommentId: null}).exec()
  .then(function(comment) {
    if(comment) {
      comment.replyCount = comment.replyCount + 1;
      comment.save(function(error, videoComment) {
        return videoComment
      })
    } else {
      return false;
    }
  })
};

Comment.prototype.get = function() {
  return CommentModel.find({}).exec();
};


Comment.prototype.getByParentCommentId = function(parentId) {
  return CommentModel.find({parentCommentId: parentId}).sort({commentCreatedDate: -1}).limit(2).lean().exec();
};

Comment.prototype.getParentCommentByVideoId = function(params) {
  console.log('params.videoId : ' + params.videoId);
  return CommentModel.find( { videoId: params.videoId , replyDepth: 0} ).sort({commentCreatedDate: -1}).limit(10).lean().exec();
};

Comment.prototype.getById = function(id) {
  return CommentModel.findById({_id: id}).exec();
};

Comment.prototype.update = function(params) {
  return CommentModel.findByIdAndUpdate(params.id, params.update, { new: true }).exec();
};

Comment.prototype.remove = function(id) {
  return CommentModel.findByIdAndRemove({_id: id}).exec();
};


module.exports = new Comment();