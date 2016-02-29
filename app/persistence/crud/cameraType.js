var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.CameraType');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var CameraTypeModel							= mongoose.model('CameraType');

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
    this.data.isVisible    = parmas.isVisible || null;


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
 * @param params.isVisible     {string}
 */

CameraType.prototype.create = function(params){

  var preCondition = this.getPreCondition({sourceLocation : "persistence.crud.CameraType.create"});

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
    if (validation.errors !== null) {
      reject(validation.errors);
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
        reject(errorMessage.getErrorMessage());
      } else {
        resolve(cameraType);
      }
    })

  })
  );
};

CameraType.prototype.get = function(params) {
  CameraTypeModel.find({isVisible: true}).exec()
    .then(function(cameraTypes){
      return res.send(cameraTypes);
    })
    .catch(function(err){
      return err;
    })
};

CameraType.prototype.remove = function(req, res) {
  CameraTypeModel.findByIdAndRemove({_id: req.body._id}).exec()
  .then(function(cameraType){
    return res.send(cameraType)
  })
  .catch(function(err){
    return err;
  })9
};

module.exports = new CameraType();

