"use strict";
try {
  var Promise											= require('bluebird');
  var log4js											= require('log4js');
  var logger											= log4js.getLogger('persistance.crud.PlayList');
  var ErrorMessage								= require('../../utils/errorMessage');
  var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
  var database                    = require('../database/database');
  var PlaylistModel							  = database.getModelByDotPath({  modelDotPath  : "app.persistence.model.playlist" });
}
catch(exception) {
  logger.error(" import error:" + exception);
}
var Playlist = function(){

};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
Playlist.prototype.getPreCondition = function(params) {

  var sourceLocation = params.sourceLocation;
  /*
   * @type {string}
   */
  var preCondition = new ObjectValidationUtil();
  /*
   * @type {object}
   */

  preCondition.setValidation(function(params) {
    var errorMessage         = new ErrorMessage();
    this.data.playListName   = params.playListName;
    this.data.userId         = params.userId;
    this.data.videoId        = params.videoList[0];
    this.data.viewOrder      = params.videoList[1];

    if(this.data.playListName === null) {
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "playListName"
        },
        sourceLocation	: sourceLocation
      })
    }

    if(this.data.userId === null) {
      this.errors = errorMessage.getErrorMessage({
        errorId					: "VALIDA1000",
        templateParams	: {
          name : "userId"
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

  });return(preCondition);
};

/*
 * Create a new DroneType document.
 * @param params 				       {Object}
 * @param params.playListName  {string}
 * @param params.userId        {string}
 * @param params.videoId       {string}
 * @param params.viewOrder     {string}
 */

Playlist.prototype.create = function(params) {

  var preCondition = this.getPreCondition({sourceLocation : "persistence.crud.PlayList.create"});

  return(new Promise(function(resolve, reject) {

    var validation = preCondition.validate(params);
    if (validation.errors !== null) {
      reject(validation.errors);
    }

    var playlistModel = new PlaylistModel(validation.data);
    playlistModel.save(function(error, playlist) {
      if(error){
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
          errorId					: "PERS1000",
          sourceError			: error,
          sourceLocation	: "persistence.crud.DroneType.create"
        });
        reject(errorMessage.getErrorMessage());
      } else {
        resolve(playlist);
      }
    })

    })
  );
};

Playlist.prototype.get = function() {
  return PlaylistModel.find({}).exec()
};

Playlist.prototype.getById = function(id) {

  PlaylistModel.findById({_id: id}).exec()
  .then(function(playlist) {
    return res.send(playlist)
  })
  .catch(function(err) {
    return err;
  })
};

Playlist.prototype.remove = function(id) {

  PlaylistModel.findByIdAndRemove({_id: id}).exec()
  .then(function(playlist) {
    return res.send(playlist)
  })
  .catch(function(err) {
    return err;
  })
};


module.exports = new Playlist();