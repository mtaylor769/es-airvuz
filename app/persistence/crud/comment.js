var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.CameraType');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var PersistenceException				= require('../../utils/exceptions/PersistenceException');
var ValidationException					= require('../../utils/exceptions/ValidationException');
var CommentModel							= require('../model/comment');
var comment = function(){

};
/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
comment.prototype.getPreCondition = function(params){

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

comment.prototype.create = function(params) {

  var preCondition = this.getPreCondition({sourceLocation: "persistence.crud.videoComment"})

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

comment.prototype.get = function() {
  return CommentModel.find({}).exec();
};

comment.prototype.getById = function(id) {
  return CommentModel.findById({_id: id}).exec();
};

comment.prototype.update = function(params) {
  return CommentModel.findByIdAndUpdate(params.id, params.update, { new: true }).exec();
};

comment.prototype.remove = function(id) {
  return CommentModel.findByIdAndRemove({_id: id}).exec();
};