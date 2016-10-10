try {
  var Promise = require('bluebird');
  var log4js = require('log4js');
  var logger = log4js.getLogger('app.persistence.crud.droneType');
  var ErrorMessage = require('../../utils/errorMessage');
  var ObjectValidationUtil = require('../../utils/objectValidationUtil');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var DroneTypeModel = null;
  var database = require('../database/database');

  DroneTypeModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.droneType"});
  logger.debug('loaded drone model');

  if (global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");

}
catch(exception) {
  logger.error(" import error:" + exception);
}

var DroneType = function(){

};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
DroneType.prototype.getPreCondition = function(params){

  var sourceLocation = 'persistence.crud.DroneType.create';
  /*
   * @type {string}
  //  */
  // var preCondition = new ObjectValidationUtil();
  // /*
  //  * @type {object}
  //  */
  //
  // preCondition.setValidation(function(params){
    var droneType          = {};
    var errorMessage       = new ErrorMessage();
    droneType.data         = {};
    droneType.data.manufacturer = params.manufacturer || null;
    droneType.data.model        = params.model || null;
    droneType.data.isVisible    = params.isVisible || null;


    if(droneType.data.manufacturer === null){
      droneType.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "manufacturer"
        },
        displayMsg			: "This field is required",
        errorMessage		: "Manufacturer is null",
        sourceLocation	: sourceLocation
      })
    }

    if(droneType.data.model === null){
      droneType.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "model"
        },
        displayMsg			: "This field is required",
        errorMessage		: "Model is null",
        sourceLocation	: sourceLocation
      })
    }

    if(droneType.data.isVisible === null){
      droneType.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "isVisible"
        },
        displayMsg			: "This field is required",
        errorMessage		: "Visible is null",
        sourceLocation	: sourceLocation
      })
    }
    
    return DroneTypeModel.find({manufacturer: droneType.data.manufacturer, model: droneType.data.model}).exec()
      .then(function(drone) {
        console.log(drone.length);
        if(drone.length !== 0) {
          logger.error('made it into error function');
          droneType.errors = errorMessage.getErrorMessage({
            errorId					: "VALIDA1000",
            templateParams	: {
              name : "duplicate"
            },
            displayMsg			: "Duplicate",
            errorMessage		: "This is a Duplicate Drone Type",
            sourceLocation	: sourceLocation
          })
        }
      })
      .then(function() {
        return(droneType)
      })
};

/*
 * Create a new DroneType document.
 * @param params 				       {Object}
 * @param params.manufacturer  {string}
 * @param params.model         {string}
 * @param params.isVisible     {string}
 */

DroneType.prototype.create = function(params) {
    var preCondition = this.getPreCondition(params);
    return preCondition.then(function(droneType) {
      if(droneType.errors) {
        var validationException = new ValidationException({ errors : droneType.errors });
        throw validationException;
      } else {
        var droneTypeModel = new DroneTypeModel(droneType.data);
        droneTypeModel.save(function(error, droneType) {
          if(error){
            var errorMessage = new ErrorMessage();
            errorMessage.getErrorMessage({
              errorId					: "PERS1000",
              sourceError			: error,
              sourceLocation	: "persistence.crud.DroneType.create"
            });
            var persistenceException = new PersistenceException({ errors : errorMessage.getErrors() });
            throw persistenceException;
          } else {
            return droneType;
          }
        }) 
      }
    });
};

DroneType.prototype.get = function() {
  return DroneTypeModel.find({isVisible: true}).sort('name').exec();
};

DroneType.prototype.getById = function(id) {
  return DroneTypeModel.findById({_id: id}).exec();
};

DroneType.prototype.getAll = function() {
  return DroneTypeModel.find({}).sort('name').exec();
};

DroneType.prototype.update = function(params) {
  return DroneTypeModel.findByIdAndUpdate(params.id, params.update, { new: true } ).exec();
};

DroneType.prototype.remove = function(id) {
  return DroneTypeModel.findByIdAndRemove({_id: id}).exec();
};

module.exports = new DroneType();