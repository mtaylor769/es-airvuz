var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.CategoryType');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var CategoryTypeModel							= mongoose.model('CategoryType');

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
    var errorMessage = new ErrorMessage();
    this.data.backGroundImage = params.backGroundImage;
    this.data.name = params.name;
    this.data.isVisible = params.isVisible;

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
  });return(preCondition);
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
      reject(validation.errors);
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
        reject(errorMessage.getErrorMessage());
      } else {
        resolve(categoryType);
      }
    })

  })
  );
};

CategoryType.prototype.get = function() {

  CategoryTypeModel.find({}).exec()
  .then(function(categoryType){
    return res.send(categoryType);
  })
  .catch(function(err){
    return err;
  })
};

CategoryType.prototype.getById = function(id) {

  CategoryTypeModel.findById({_id: id}).exec()
  .then(function(categoryType){
    return res.send(categoryType);
  })
  .catch(function(err){
    return err;
  })
};

CategoryType.prototype.remove = function(id) {

  CategoryTypeModel.findByIdAndRemove({_id: id}).exec()
  .then(function(categoryType){
    return res.send(categoryType)
  })
  .catch(function(err){
    return err;
  })
};

module.exports = new CategoryType();