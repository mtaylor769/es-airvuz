try {
  var Promise = require('bluebird');
  var _ = require('lodash');
  var log4js = require('log4js');
  var logger = log4js.getLogger('app.persistence.crud.notifications');
  var ErrorMessage = require('../../utils/errorMessage');
  var ObjectValidationUtil = require('../../utils/objectValidationUtil');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var NotificationModel = null;
  var database = require('../database/database');
  var mongoose = require('mongoose');

  NotificationModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.notifications"});
  logger.debug('loaded notification model');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var Notifications = function() {};

function getUnseen(userId) {
  return NotificationModel
    .find({notifiedUserId: userId, notificationViewed: false})
    .sort('-createdDate')
    .limit(10)
    .populate('actionUserId', 'userNameDisplay userNameUrl')
    .lean()
    .exec();
}

function markAsSeen(userId) {
  return NotificationModel
    .update({notifiedUserId: userId, notificationViewed: false}, {notificationViewed: true}, {multi: true})
    .sort('-createdDate')
    .limit(10)
    .lean()
    .exec();
}

Notifications.prototype.create = function(params) {
  return(new Promise(function(resolve, reject) {
      if(params.notifiedUserId === params.actionUserId){
        resolve(200);
      } else {
        logger.error(params);
        var notificationModel = new NotificationModel(params);
        notificationModel.save(function(error, notification) {
          if(error) {
            reject(error);
          } else {
            resolve(notification);
          }
        }); 
      }
    })
  )
};

Notifications.prototype.getByUserId = function(id) {
  return NotificationModel.find({notifiedUserId: id, notificationViewed: false}).sort({ createdDate:-1 }).limit(10).lean().exec();
};

Notifications.prototype.getUnseenCount = function(id) {
  return NotificationModel.find({notifiedUserId: id, notificationViewed: false}).count().exec();
};

Notifications.prototype.getAllByUserId = function(id) {
  return NotificationModel.find({notifiedUserId: id}).sort({ createdDate: -1 }).populate('actionUserId').populate('notifiedUserId').exec();
};

Notifications.prototype.getByComment = function(id) {
  return NotificationModel.find({commentId: id}).lean().exec();
};

Notifications.prototype.updateComment = function(params) {
  return NotificationModel.findByIdAndUpdate(params.id, params.update, {new: true}).exec();
};

Notifications.prototype.markAllAsRead = function(id) {
  return NotificationModel.update({notifiedUserId: id, notificationViewed: false}, {notificationViewed:true}).exec();
};

Notifications.prototype.findByNotifiedUserIdAndActionUserId = function(id) {
  return NotificationModel.find({ $or: [ {notifiedUserId: id}, {actionUserId: id} ] }).exec();
};

Notifications.prototype.delete = function(id) {
  return NotificationModel.findByIdAndRemove(id).exec();
}


Notifications.prototype.getUnseen = getUnseen;
Notifications.prototype.markAsSeen = markAsSeen;



module.exports = new Notifications();