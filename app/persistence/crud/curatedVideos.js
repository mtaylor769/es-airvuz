var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.CuratedVideos');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var CuratedVideoModel						= mongoose.model('CuratedVideos');

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

  var preCondition = this.getPreCondition({sourceLocation : "persistence.crud.CuratedVideos.create"});

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
    if (validation.errors !== null) {
      reject(validation.errors);
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
        reject(errorMessage.getErrorMessage());
      } else {
        resolve(curatedVideo);
      }
    })
  })
  );
};

CuratedVideo.prototype.get = function() {
  CuratedVideoModel.find({}).exec()
  .then(function(curatedVideos){
    return res.send(curatedVideos)
  })
  .catch(function(err){
    return err;
  })
};

CuratedVideo.prototype.getById = function(id) {
  CuratedVideoModel.findById({_id: id}).exec()
  .then(function(curatedVideo){
    return res.send(curatedVideo);
  })
  .catch(function(err){
    return err;
  })
};

CuratedVideo.prototype.remove = function(id) {
  CuratedVideoModel.findByIdAndRemove({_id: id}).exec()
  .then(function(curatedVideo){
    return res.send(curatedVideo)
  })
  .catch(function(err){
    return err;
  })
};

module.exports = new CuratedVideo();