// IMPORT: BEGIN
var namespace				= 'app.views.model.videoPlayerModel';
var log4js					= require('log4js');
var logger					= log4js.getLogger(namespace);


try {
  var BaseModel	          = require('./baseModel');
  var EventTrackingCrud		= require('../../persistence/crud/events/eventTracking');
  var Promise		          = require('bluebird');
  var notificationCrud    = require('../../persistence/crud/notifications');
  var moment				      = require('moment');
  var util			          = require('util');
  var config				      = require('../../../config/config')[process.env.NODE_ENV || 'development'];

  if(global.NODE_ENV === "production") {
    logger.setLevel("WARN");
  }

  logger.info("import complete");
}
catch(exception) {
  logger.error(" import error:" + exception);
}
// IMPORT: END

var NotificationModel = function(params) {
  logger.debug("constructor: IN");

  BaseModel.apply(this, arguments);
};

util.inherits(NotificationModel, BaseModel);

NotificationModel.prototype.getData = function(params) {
  EventTrackingCrud.create({
    codeSource	: namespace,
    eventSource : "nodejs",
    eventType		: "getData"
  });

  var userId          = params.request.params.id;
  var dataObject      = {};
  var sourceManifest	= params.sourceManifest;

  return notificationCrud.getAllByUserId(userId)
    .then(function(notifications) {
      notifications.forEach(function(notification) {
        if(notification.notificationType === 'COMMENT'){
          notification.notificationMessage = 'commented on your <a href="/videoPlayer/' + notification.videoId +'">video</a> : ' + '"' + notification.notificationMessage + '"';
        } else if(notification.notificationType === 'COMMENT REPLY') {
          notification.notificationMessage = 'replied to your <a href="/videoPlayer/' + notification.videoId + '">comment</a> : ' + '"' +notification.notificationMessage + '"'
        } else if(notification.notificationType === 'LIKE') {
          notification.notificationMessage = 'Liked your <a href="/videoPlayer/' + notification.videoId + '">video</a>';
        }
        logger.debug('type of action user : ' + notification.actionUserId);
        logger.debug(typeof notification);
        if(typeof notification.actionUserId === "undefined") {
        logger.debug('type of action user inside function : ' + notification.actionUserId);
          notification.actionUserId = new Object();
        logger.debug('should be an object : ' + notification.actionUserId);
        }
      });
      dataObject.notifications = notifications;

      params.data													= dataObject;
      params.data.airvuz 									= {};
      params.data.vendor 									= {};
      params.data.airvuz.js 							= sourceManifest["airvuz.js"];
      params.data.airvuz.css 							= sourceManifest["airvuz.css"];
      params.data.vendor.js 							= sourceManifest["vendor.js"];
      return params;
    });

};

module.exports = NotificationModel;