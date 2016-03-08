var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.DroneType');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var PersistenceException				= require('../../utils/exceptions/PersistenceException');
var ValidationException					= require('../../utils/exceptions/ValidationException');
var DroneTypeModel							= require('../model/droneType');

var DroneType = function(){

};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
DroneType.prototype.getPreCondition = function(params){

  var sourceLocation = params.sourceLocation;
  /*
   * @type {string}
   */
  var preCondition = new ObjectValidationUtil();
  /*
   * @type {object}
   */

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
 * Create a new DroneType document.
 * @param params 				       {Object}
 * @param params.manufacturer  {string}
 * @param params.model         {string}
 * @param params.isVisible     {string}
 */

DroneType.prototype.create = function(params) {

  var preCondition = this.getPreCondition({sourceLocation : "persistence.crud.DroneType.create"});

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
    if (validation.errors !== null) {
      var validationException = new ValidationException({ errors : validation.errors });
      reject(validationException);
    }

    var droneTypeModel = new DroneTypeModel(validation.data);
    droneTypeModel.save(function(error, droneType) {
      if(error){
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
          errorId					: "PERS1000",
          sourceError			: error,
          sourceLocation	: "persistence.crud.DroneType.create"
        });
        var persistenceException = new PersistenceException({ errors : errorMessage.getErrors() });
        reject(persistenceException);
      } else {
        resolve(droneType);
      }
    })

  })
  );
};

DroneType.prototype.get = function() {
  return DroneTypeModel.find({isVisible: true}).exec()
};

DroneType.prototype.getById = function(id) {
  return DroneTypeModel.findById({_id: id}).exec()
};

DroneType.prototype.remove = function(id) {
  return DroneTypeModel.findByIdAndRemove({_id: id}).exec()
};

module.exports = new DroneType();