try {
  var Promise = require('bluebird');
  var _ = require('lodash');
  var log4js = require('log4js');
  var logger = log4js.getLogger('persistance.crud.Videos');
  var ErrorMessage = require('../../utils/errorMessage');
  var ObjectValidationUtil = require('../../utils/objectValidationUtil');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var NotificationModel = null;
  var database = require('../database/database');
  var mongoose = require('mongoose');

  NotificationModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.notifications"});
  logger.debug('loaded video like model');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var Notifications = function() {

};


Notifications.prototype.create = function(params) {

};


module.exports = new Notifications();