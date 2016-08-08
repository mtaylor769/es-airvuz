try {
  var Promise = require('bluebird');
  var _ = require('lodash');
  var log4js = require('log4js');
  var logger = log4js.getLogger('app.persistence.crud.follow');
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
      if (params.followingUserId !== params.userId) {
        //Cannot follow self
        FollowModel.find({followingUserId : params.followingUserId, userId : params.userId}).exec()
          .then(function(follow) {
            if(follow.length === 0) {
              var followModel = new FollowModel(params);
              followModel.save(function(error, follow) {
                resolve(follow);
                return;
              })
            } else {
              logger.debug(follow);
              reject({followId: follow[0]._id});
              return;
            }
          })
          .error(function(error){
            reject(error);
            return;
          })
      } else {
        var errorMessage						= new ErrorMessage();
        errorMessage.getErrorMessage({
          statusCode								: "500",
          errorId 									: "PERS1000",
          errorMessage 							: "Cannot follow self",
          sourceError								: "Cannot follow self",
          sourceLocation						: "persistence.crud.Users.delete"
        });
        reject(errorMessage);
        return;
      }
    })
  );
};

Follow.prototype.followCheck = function(params) {
  return FollowModel.findOne({followingUserId:params.followingUserId, userId:params.userId}).exec()
};

Follow.prototype.followCount = function(userId) {
  return FollowModel.find({followingUserId: userId}).count().exec();
};

Follow.prototype.followingCount = function(userId) {
  return FollowModel.find({userId: userId}).count().exec();
};

Follow.prototype.delete = function(id) {
  return FollowModel.findByIdAndRemove(id).exec();
};

Follow.prototype.getFollowers = function(userId, skip) {
  return FollowModel.find({followingUserId: userId})
    .sort({createdDate: -1})
    .skip(skip)
    .limit(10)
    .populate('userId', 'userNameDisplay userNameUrl profilePicture _id')
    .lean()
    .exec()
};

Follow.prototype.getFollowing = function(userId, skip) {
  return FollowModel.find({userId: userId})
    .sort({createdDate: -1})
    .skip(skip)
    .limit(10)
    .populate('followingUserId', 'userNameDisplay userNameUrl profilePicture _id')
    .lean()
    .exec()
};

Follow.prototype.findByFollowingUserIdAndUserId = function(id) {
  return FollowModel.find({ $or: [ {followingUserId: id}, {userId: id} ] }).exec()
};

Follow.prototype.findFollowersByUserIdAndDate = function(userId, startDate, endDate) {
  return FollowModel.find({followingUserId: userId, createdDate: {$gte: new Date(startDate), $lte: new Date(endDate)}}).count().exec();
};

Follow.prototype.findFollowingByUserIdAndDate = function(userId, startDate, endDate) {
  return FollowModel.find({userId: userId, createdDate: {$gte: new Date(startDate), $lte: new Date(endDate)}}).count().exec();
};

Follow.prototype.findFollowByUserIdAndVideoOwnerId = function(userId, videoOwnerId) {
  return FollowModel.findOne({userId: userId, followingUserId: videoOwnerId}).exec();
};

Follow.prototype.getFollow = getFollow;


module.exports = new Follow();