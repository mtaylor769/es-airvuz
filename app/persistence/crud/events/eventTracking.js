try {
  // import
  var log4js              = require('log4js');
  var logger              = log4js.getLogger('app.persistence.crud.events.eventTracking');
  var database            = require('../../database/database');
  var EventTrackingModel  = database.getModelByDotPath({modelDotPath: 'app.persistence.model.events.eventTracking'});
  var Promise             = require('bluebird');

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

function getByVideoId(videoId, startDate, endDate) {

  function getVideoStart(videoId, startDate, endDate) {
    return EventTrackingModel.find({videoId: videoId, createdDate: {$gte: startDate, $lte: endDate}, eventName: 'video-play-start'}).exec();
  }

  function getVideoEnd(videoId, startDate, endDate) {
    return EventTrackingModel.find({videoId: videoId, createdDate: {$gte: startDate, $lte: endDate}, eventName: 'video-ended'}).exec();
  }

  function getVideoExit(videoId, startDate, endDate) {
    return EventTrackingModel.find({videoId: videoId, createdDate: {$gte: startDate, $lte: endDate}, eventName: 'video-exited-on-playing'}).exec();
  }

  var promises = [
    getVideoStart(videoId, startDate, endDate),
    getVideoEnd(videoId, startDate, endDate),
    getVideoExit(videoId, startDate, endDate)
  ];

  return Promise.all(promises)
      .spread(function(start, end, exit) {
        var eventsObj = {};
        eventsObj.videoEnded = end;
        eventsObj.videoStart = start;
        eventsObj.videoExit = {};
        eventsObj.videoExit.timeWatched = 0;
        eventsObj.videoExit.totalTime = 0;

        exit.forEach(function(event) {
          eventsObj.videoExit.timeWatched += event.eventVideoPlaybackDetails.viewDuration;
          eventsObj.videoExit.totalTime += event.eventVideoPlaybackDetails.totalDuration;
        });

        return eventsObj;
      });
}

EventTracking.prototype.create = create;
EventTracking.prototype.getByVideoId = getByVideoId;

module.exports = new EventTracking();