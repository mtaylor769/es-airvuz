try{
var Promise = require('bluebird');
var mongoose = require('mongoose');
var log4js = require('log4js');
var logger = log4js.getLogger('app.persistence.crud.cameraType');
var ErrorMessage = require('../../utils/errorMessage');
var ObjectValidationUtil = require('../../utils/objectValidationUtil');
var PersistenceException = require('../../utils/exceptions/PersistenceException');
var ValidationException = require('../../utils/exceptions/ValidationException');
var CameraTypeModel = null;
var database = require('../database/database');

  CameraTypeModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.cameraType"});

  logger.debug('loaded camera model');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");

}
catch(exception) {
  logger.error(" import error:" + exception);
}


var CameraType = function(){

};
/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
CameraType.prototype.getPreCondition = function(params){

  /*
   * @type {string}
   */
  var sourceLocation = params.sourceLocation;
  /*
   * @type {object}
   */
  var preCondition = new ObjectValidationUtil();

  preCondition.setValidation(function(params){
    var errorMessage       = new ErrorMessage();
    this.data.manufacturer = params.manufacturer || null;
    this.data.model        = params.model || null;
    this.data.isVisible    = params.isVisible || null;


    if(this.data.manufacturer === null){
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "manufacturer"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.model === null){
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "model"
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
  });return(preCondition)

};

/*
 * Create a new CameraType document.
 * @param params 				       {Object}
 * @param params.manufacturer  {string}
 * @param params.model         {string}
 * @param params.isVisible     {boolean}
 */

CameraType.prototype.create = function(params){

  var preCondition = this.getPreCondition({sourceLocation : "persistence.crud.CameraType.create"});

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
    if (validation.errors !== null) {
      var validationException = new ValidationException({ errors : validation.errors });
      reject(validationException);
			return;
    }

    var cameraTypeModel = new CameraTypeModel(validation.data);
    cameraTypeModel.save(function(error, cameraType){
      if(error){
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
          errorId					: "PERS1000",
          sourceError			: error,
          sourceLocation	: "persistence.crud.CameraType.create"
        });

        var persistenceException = new PersistenceException({ errors : errorMessage.getErrors() });
        reject(persistenceException);
				return;
      } else {
        resolve(cameraType);
				return;
      }
    })
		

  })
  );
};

CameraType.prototype.get = function() {
  return CameraTypeModel.find({isVisible: true}).exec();
};

CameraType.prototype.getById = function(id) {
  return CameraTypeModel.findById({_id: id}).exec();
};

CameraType.prototype.update = function(params) {
  return CameraTypeModel.findByIdAndUpdate(params.id, params.update, { new: true } );
};

CameraType.prototype.remove = function(id) {
  return CameraTypeModel.findByIdAndRemove({_id: id}).exec();
};


module.exports = new CameraType();

