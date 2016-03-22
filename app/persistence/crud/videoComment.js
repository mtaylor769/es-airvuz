var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.CameraType');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var PersistenceException				= require('../../utils/exceptions/PersistenceException');
var ValidationException					= require('../../utils/exceptions/ValidationException');
var VideoCommentModel							= require('../model/videoComment');

var VideoComment = function(){

};
/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
VideoComment.prototype.getPreCondition = function(params){

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
    this.data.comment             = params.comment || null;
    this.data.commentCreatedDate  = params.commentCreatedDate || null;
    this.data.isVisible           = params.isVisible || null;
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

    if(this.data.commentCreatedDate === null){
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "commentCreatedDate"
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

VideoComment.prototype.create = function(params) {

  var preCondition = this.getPreCondition({sourceLocation: "persistence.crud.videoComment"})

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
    if(validation.errors !== null) {
      var validationException = new ValidationException({errors: validation.errors});
      reject(validationException);
      return;
    }

    var videoCommentModel = new VideoCommentModel(validation.data);
    videoCommentModel.save(function(error, videoComment) {
      if(error) {
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
          errorId					: "PERS1000",
          sourceError			: error,
          sourceLocation	: "persistence.crud.videoComment.create"
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

VideoComment.prototype.get = function() {
  return VideoCommentModel.find({}).exec();
};

VideoComment.prototype.getById = function(id) {
  return VideoCommentModel.findById({_id: id}).exec();
};

VideoComment.prototype.update = function(params) {
  return VideoCommentModel.findByIdAndUpdate(params.id, params.update, { new: true }).exec();
};

VideoComment.prototype.remove = function(id) {
  return VideoCommentModel.findByIdAndRemove({_id: id}).exec();
};