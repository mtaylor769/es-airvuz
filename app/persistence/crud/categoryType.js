try {
  var Promise = require('bluebird');
  var log4js = require('log4js');
  var logger = log4js.getLogger('persistance.crud.CategoryType');
  var ErrorMessage = require('../../utils/errorMessage');
  var ObjectValidationUtil = require('../../utils/objectValidationUtil');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var CategoryTypeModel = null;
  var database = require('../database/database');

  CategoryTypeModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.categoryType"})
  logger.debug('loaded category model');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");

}
catch(exception) {
  logger.error(" import error:" + exception);
}
var CategoryType = function(){

};

function getByUrl(url) {
  return CategoryTypeModel.findOne({categoryTypeUrl: url}).exec();
}

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
    var errorMessage = new ErrorMessage();
    this.data.backGroundImage = params.backGroundImage || null;
    this.data.name = params.name || null;
    this.data.isVisible = params.isVisible || null;
		
		logger.debug("getPreCondition - params.backGroundImage:" + params.backGroundImage);
		logger.debug("getPreCondition - params.name:" + params.name);

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

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
    if (validation.errors !== null) {
      var validationException = new ValidationException({ errors : validation.errors });
      reject(validationException);
			return;
    }

    var categoryTypeModel = new CategoryTypeModel(validation.data);
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
  return CategoryTypeModel.find({isVisible: true}).sort('name').exec();
};

CategoryType.prototype.getById = function(id) {
  return CategoryTypeModel.findById({_id: id}).exec();
};

CategoryType.prototype.update = function(params) {
  return CategoryTypeModel.findByIdAndUpdate(params.id, params.update, { new: true } ).exec();
};

CategoryType.prototype.remove = function(id) {
  return CategoryTypeModel.findByIdAndRemove({_id: id}).exec();
};

CategoryType.prototype.getByUrl = getByUrl;

module.exports = new CategoryType();