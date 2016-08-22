try {
  // import
  var log4js              = require('log4js');
  var logger              = log4js.getLogger('app.persistence.crud.events.eventTracking');
  var database            = require('../../database/database');
  var EventTrackingModel  = database.getModelByDotPath({modelDotPath: 'app.persistence.model.events.eventTracking'});

  if (global.NODE_ENV === 'production') {
    logger.setLevel('INFO');
  }
}
catch (exception) {
  logger.error(' import error:' + exception);
}

function EventTracking() {
}

function create(params) {
  var eventTrackingModel = new EventTrackingModel(params);

  return eventTrackingModel
    .save();
}

EventTracking.prototype.create = create;

module.exports = new EventTracking();