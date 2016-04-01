try {
  var Promise = require('bluebird');
  var mongoose = require('mongoose');
  var log4js = require('log4js');
  var logger = log4js.getLogger('persistance.crud.CuratedVideos');
  var ErrorMessage = require('../../utils/errorMessage');
  var ObjectValidationUtil = require('../../utils/objectValidationUtil');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var CuratedVideoModel = null;
  var database = require('../database/database');

  CuratedVideoModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.curatedVideos"})
  logger.debug('loaded curated videos model');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");

}
catch(exception) {
  logger.error(" import error:" + exception);
}

var CuratedVideo = function(){

};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */

CuratedVideo.prototype.getPreCondition = function(params) {

  var sourceLocation = params.sourceLocation;
  /*
   * @type {string}
   */
  var preCondition = new ObjectValidationUtil();
  /*
   * @type {object}
   */
  preCondition.setValidation(function(params) {
    var errorMessage        = new ErrorMessage();
    this.data.curatedType   = params.curatedType || null;
    this.data.videoId       = params.videoId || null;
    this.data.viewOrder     = params.viewOrder || null;

    if(this.data.curatedType === null) {
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "curatedType"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.videoId === null) {
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "videoId"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.viewOrder === null) {
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "viewOrder"
        },
        sourceLocation	: sourceLocation
      })
    }
  }); return(preCondition);
};

/*
 * Create a new DroneType document.
 * @param params 				      {Object}
 * @param params.curatedType  {string}
 * @param params.videoId      {string}
 * @param params.viewOrder    {number}
 */

CuratedVideo.prototype.create = function(params) {
  console.log('here');
  var preCondition = this.getPreCondition({sourceLocation : "persistence.crud.CuratedVideos.create"});

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
    if (validation.errors !== null) {
      var validationException = new ValidationException({ errors : validation.errors });
      reject(validationException);
			return;
    }

    var curatedVideosModel = new CuratedVideoModel(validation.data);
    curatedVideosModel.save(function(error, curatedVideo){
      if(error) {
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
          errorId					: "PERS1000",
          sourceError			: error,
          sourceLocation	: "persistence.crud.DroneType.create"
        });
        var persistenceException = new PersistenceException({ errors : errorMessage.getErrors() });
        reject(persistenceException);
				return;
      } else {
        resolve(curatedVideo);
				return;
      }
    })
  })
  );
};

CuratedVideo.prototype.get = function(type) {
  return CuratedVideoModel.find({curatedType: type}).exec();
};

CuratedVideo.prototype.getById = function(id) {
  return CuratedVideoModel.findById({_id: id}).exec();
};

CuratedVideo.prototype.update = function(params) {
  return CuratedVideoModel.findByIdAndUpdate(params.id, params.update, { new: true } ).exec();
}

CuratedVideo.prototype.remove = function(id) {
  return CuratedVideoModel.findByIdAndRemove({_id: id}).exec();
};

module.exports = new CuratedVideo();