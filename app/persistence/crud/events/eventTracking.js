try {
  // import
  var log4js              = require('log4js');
  var logger              = log4js.getLogger('app.persistence.crud.events.eventTracking');
  var database            = require('../../database/database');
  var EventTrackingModel  = database.getModelByDotPath({modelDotPath: 'app.persistence.model.events.eventTracking'});
  var Promise             = require('bluebird');
  var moment              = require('moment');

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

function getVideoStart(videoId, startDate, endDate) {
    return EventTrackingModel.find({videoId: videoId, createdDate: {$gte: startDate, $lte: endDate}, eventName: 'video-play-start'}).count().exec();
}

function getVideoEnd(videoId, startDate, endDate) {
    return EventTrackingModel.find({videoId: videoId, createdDate: {$gte: startDate, $lte: endDate}, eventName: 'video-ended'}).count().exec();
}

function getVideoExit(videoId, startDate, endDate) {
    return EventTrackingModel.find({videoId: videoId, createdDate: {$gte: startDate, $lte: endDate}, eventName: 'video-exited-on-playing'}).lean().exec();
}

function getByVideoId(videoId, startDate, endDate) {

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

/**
 * check to see if cron ran in the last 4 hour
 * @returns {Promise|Boolean}
 */
function didTrendingRun() {
  return EventTrackingModel.findOne({eventName: 'cron:trending'}).sort('-createdDate').exec()
    .then(function (event) {
      if (!event) {
        return false;
      }
      var lastRun = moment(event.createdDate);
      var now = moment();
      var diff = now.diff(lastRun, 'hour', true);

      return diff < 4;
    });
}

EventTracking.prototype.create = create;
EventTracking.prototype.getByVideoId = getByVideoId;
EventTracking.prototype.didTrendingRun = didTrendingRun;

module.exports = new EventTracking();