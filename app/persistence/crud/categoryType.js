var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.CategoryType');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var PersistenceException				= require('../../utils/exceptions/PersistenceException');
var ValidationException					= require('../../utils/exceptions/ValidationException');
var CategoryTypeModel						= require('../model/categoryType');

var CategoryType = function(){

};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */

CategoryType.prototype.getPreCondition = function(params) {
  var sourceLocation = params.sourceLocation;
  /*
   * @type {string}
   */
  var preCondition = new ObjectValidationUtil();
  /*
   * @type {object}
   */

  preCondition.setValidation(function(params){
		console.log("CategoryType.setValidation");
		console.log("CategoryType.setValidation params.backGroundImage: " + params.backGroundImage);
    var errorMessage = new ErrorMessage();
    this.data.backGroundImage = params.backGroundImage || null;
    this.data.name = params.name || null;
    this.data.isVisible = params.isVisible || null;

    if(this.data.backGroundImage === null) {
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "backGroundImage"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.name === null) {
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "name"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.isVisible === null) {
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "isVisible"
        },
        sourceLocation	: sourceLocation
      })
    }
  });
	
	return(preCondition);
};
/*
 * Create a new DroneType document.
 * @param params 				          {Object}
 * @param params.backGroundImage  {string}
 * @param params.name             {string}
 * @param params.isVisible        {string}
 */
CategoryType.prototype.create = function(params) {

  var preCondition = this.getPreCondition({sourceLocation : "persistence.crud.CategoryType.create"});

	console.log("CategoryType.create");

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
		console.log("CategoryType.postValidate");
		console.log("CategoryType validation.errors:" + typeof(validation.errors) + "   : " + validation.errors);
    if (validation.errors !== null) {
      var validationException = new ValidationException({ errors : validation.errors });
			console.log("CategoryType: validation error");
      reject(validationException);
			return;
    }

    var categoryTypeModel = new CategoryTypeModel(validation.data);
		console.log("CategoryType: persist");
    categoryTypeModel.save(function(error, categoryType){
      if(error){
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
          errorId					: "PERS1000",
          sourceError			: error,
          sourceLocation	: "persistence.crud.CategoryType.create"
        });
        var persistenceException = new PersistenceException({ errors : errorMessage.getErrors() });
        reject(persistenceException);
				return;
      } else {
        resolve(categoryType);
				return;
      }
    })

  })
  );
};

CategoryType.prototype.get = function() {
  return CategoryTypeModel.find({isVisible: true}).exec();
};

CategoryType.prototype.getById = function(id) {
  return CategoryTypeModel.findById({_id: id}).exec();
};

CategoryType.prototype.remove = function(id) {
  return CategoryTypeModel.findByIdAndRemove({_id: id}).exec();
};

module.exports = new CategoryType();