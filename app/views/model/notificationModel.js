// IMPORT: BEGIN
var namespace				= 'app.views.model.videoPlayerModel';
var log4js					= require('log4js');
var logger					= log4js.getLogger(namespace);
var _               = require('lodash');


try {
  var BaseModel	          = require('./baseModel');
  var EventTrackingCrud		= require('../../persistence/crud/events/eventTracking');
  var notificationCrud    = require('../../persistence/crud/notifications');
  var moment				      = require('moment');
  var util			          = require('util');
  var config				      = require('../../../config/config')[process.env.NODE_ENV || 'development'];
  var amazonConfig			  = require('../../config/amazon.config');

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

      var notificationClone = [];
      
      notifications.forEach(function(notification) {

        //new notification object for manual clone
        var notificationObject = {};

        //if statement checking for actionUserId
        if(typeof notification.actionUserId === "undefined") {
          notificationObject.actionUserId = {};
          notificationObject.actionUserId.userName = "Someone";
        } else {
          notificationObject.actionUserId = notification.actionUserId;
          notificationObject.actionUserId.userName = notification.actionUserId.userName;
        }

        //setting the rest of the notificationObject
        notificationObject.createdDate = notification.createdDate;
        notificationObject.notificationType = notification.notificationType;
        notificationObject.notificationMessage = notification.notificationMessage;
        notificationObject.notifiedUserId = notification.notifiedUserId;
        notificationObject.notificationViewed = notification.notificationViewed;
        notificationObject.videoId = notification.videoId;

        //creating display html for dust
        if(notification.notificationType === 'COMMENT'){
          notificationObject.notificationMessage = 'commented on your <a href="/videoPlayer/' + notification.videoId +'">video</a> : ' + '"' + notification.notificationMessage + '"';
        } else if(notification.notificationType === 'COMMENT REPLY') {
          notificationObject.notificationMessage = 'replied to your <a href="/videoPlayer/' + notification.videoId + '">comment</a> : ' + '"' +notification.notificationMessage + '"'
        } else if(notification.notificationType === 'LIKE') {
          notificationObject.notificationMessage = 'Liked your <a href="/videoPlayer/' + notification.videoId + '">video</a>';
        }

        notificationClone.push(notificationObject);

      });

      dataObject.notifications = notificationClone;

      params.data													= dataObject;
      params.data.airvuz 									= {};
      params.data.vendor 									= {};
      params.data.airvuz.js 							= sourceManifest["airvuz.js"];
      params.data.airvuz.css 							= sourceManifest["airvuz.css"];
      params.data.vendor.js 							= sourceManifest["vendor.js"];

      params.data.s3AssetUrl 							= amazonConfig.ASSET_URL;
      return params;
    });

};

module.exports = NotificationModel;