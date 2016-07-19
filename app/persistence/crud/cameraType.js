try{
var Promise = require('bluebird');
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
    var sourceLocation = 'persistence.crud.CameraType.create';
    var errorMessage             = new ErrorMessage();
    var cameraType               = {};
    cameraType.data              = {};
    cameraType.data.manufacturer = params.manufacturer || null;
    cameraType.data.model        = params.model || null;
    cameraType.data.isVisible    = params.isVisible || null;


    if(cameraType.data.manufacturer === null){
      cameraType.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "manufacturer"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(cameraType.data.model === null){
      cameraType.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "model"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(cameraType.data.isVisible === null){
      cameraType.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "isVisible"
        },
        sourceLocation	: sourceLocation
      })
    }
  
    return CameraTypeModel.find({manufacturer: cameraType.data.manufacturer, model: cameraType.data.model}).exec()
      .then(function(camera) {
        if(camera.length !== 0) {
          cameraType.errors = errorMessage.getErrorMessage({
            errorId					: "VALIDA1000",
            templateParams	: {
              name : "duplicate"
            },
            displayMsg			: "Duplicate",
            errorMessage		: "This is a Duplicate Camera Type",
            sourceLocation	: sourceLocation
          })
        }
      })
      .then(function() {
        return(cameraType);
      })
  };


/*
 * Create a new CameraType document.
 * @param params 				       {Object}
 * @param params.manufacturer  {string}
 * @param params.model         {string}
 * @param params.isVisible     {boolean}
 */

CameraType.prototype.create = function(params){
  var preCondition = this.getPreCondition(params);
    return preCondition.then(function(cameraType) {
      if (cameraType.errors) {
        var validationException = new ValidationException({ errors : cameraType.errors });
        throw validationException;
      } else {
        var cameraTypeModel = new CameraTypeModel(cameraType.data);
        cameraTypeModel.save(function(error, cameraType){
          if(error){
            var errorMessage = new ErrorMessage();
            errorMessage.getErrorMessage({
              errorId					: "PERS1000",
              sourceError			: error,
              sourceLocation	: "persistence.crud.CameraType.create"
            });

            var persistenceException = new PersistenceException({ errors : errorMessage.getErrors() });
            throw persistenceException;
          } else {
            return cameraType;
          }
        })
      }
    })
};

CameraType.prototype.get = function() {
  return CameraTypeModel.find({isVisible: true}).sort('name').lean().exec();
};

CameraType.prototype.getById = function(id) {
  return CameraTypeModel.findById({_id: id}).exec();
};

CameraType.prototype.getAll = function() {
  return CameraTypeModel.find({}).sort('name').exec();
};

CameraType.prototype.update = function(params) {
  return CameraTypeModel.findByIdAndUpdate(params.id, params.update, { new: true } );
};

CameraType.prototype.remove = function(id) {
  return CameraTypeModel.findByIdAndRemove({_id: id}).exec();
};


module.exports = new CameraType();

