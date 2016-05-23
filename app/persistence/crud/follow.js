try {
  var Promise = require('bluebird');
  var _ = require('lodash');
  var log4js = require('log4js');
  var logger = log4js.getLogger('persistance.crud.Videos');
  var ErrorMessage = require('../../utils/errorMessage');
  var ObjectValidationUtil = require('../../utils/objectValidationUtil');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var FollowModel = null;
  var database = require('../database/database');
  var mongoose = require('mongoose');

  FollowModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.followers"});
  logger.debug('loaded video like model');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var Follow = function () {};

function getFollow(userId) {
  return FollowModel
    .find({userId: userId})
    .select('followingUserId')
    .lean()
    .exec();
}

Follow.prototype.create = function(params) {
  return(new Promise(function(resolve, reject) {
      FollowModel.find({followingUserId : params.followingUserId, userId : params.userId}).exec()
      .then(function(follow) {
        if(follow.length === 0) {
          var followModel = new FollowModel(params);
          followModel.save(function(error, follow) {
            resolve(follow);
          })
        } else {
          console.log(follow);
          reject({followId: follow[0]._id});
        }
      })
    })
  )
};

Follow.prototype.followCheck = function(params) {
  return FollowModel.findOne({followingUserId:params.followingUserId, userId:params.userId}).exec()
};

Follow.prototype.followCount = function(userId) {
  return FollowModel.find({followingUserId: userId}).count().exec();
};

Follow.prototype.delete = function(id) {
  return FollowModel.findByIdAndRemove(id).exec();
};

Follow.prototype.getFollow = getFollow;


module.exports = new Follow();