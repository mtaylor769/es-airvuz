try {
  // import
  var log4js              = require('log4js');
  var logger              = log4js.getLogger('app.persistence.crud.events.eventTracking');
  var database            = require('../../database/database');
  var EventTrackingModel  = database.getModelByDotPath({modelDotPath: 'app.persistence.model.events.eventTracking'});
  var moment              = require('moment');
  var _                   = require('lodash');

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

function _getVideoEvent(videoId, startDate, endDate) {
  return EventTrackingModel.aggregate(

    // Pipeline
    [
      // Stage 1
      {
        $match: {
          videoId: videoId.toString(),
          createdDate: {
            $gte: startDate,
            $lte: endDate
          },
          $or: [
            {eventName: 'video-play-start'},
            {eventName: 'video-ended'},
            {eventName: 'video-exited-on-playing'}
          ]
        }
      },

      // Stage 2
      {
        $group: {
          _id: '$eventName',
          videoId: {
            $last: "$videoId"
          },
          total: {$sum: 1},
          timeWatched: {$sum: '$eventVideoPlaybackDetails.viewDuration'},
          totalTime: {$sum: '$eventVideoPlaybackDetails.totalDuration'},
          videoDuration: {
              $max: '$eventVideoPlaybackDetails.totalDuration'
          }
        }
      }
    ]
  ).exec();

}

function getByVideoId(videoId, startDate, endDate) {
  return _getVideoEvent(videoId, startDate, endDate)
      .then(function(result) {
        var eventsObj = {};
        var composedAggregate = _.keyBy(result, '_id');
        var videoDuration = composedAggregate['video-exited-on-playing'].videoDuration;
        var endedTotalTime = (videoDuration * composedAggregate['video-ended'].total) || 0;

        eventsObj.videoEnded = composedAggregate['video-ended'] ? composedAggregate['video-ended'].total : 0;
        eventsObj.videoStart = composedAggregate['video-play-start'] ? composedAggregate['video-play-start'].total : 0;
        eventsObj.videoExit = {};
        eventsObj.videoExit.timeWatched = composedAggregate['video-exited-on-playing'] ? composedAggregate['video-exited-on-playing'].timeWatched : 0;
        eventsObj.videoExit.totalTime = composedAggregate['video-exited-on-playing'] ? composedAggregate['video-exited-on-playing'].totalTime : 0;
        eventsObj.viewPercentage = {};
        eventsObj.viewPercentage.timeWatched = ((eventsObj.videoExit.timeWatched ? eventsObj.videoExit.timeWatched : 0) + endedTotalTime);
        eventsObj.viewPercentage.totalTime = ((eventsObj.videoExit.totalTime ? eventsObj.videoExit.totalTime : 0) + endedTotalTime);
        eventsObj.viewPercentage.percentage = (eventsObj.viewPercentage.timeWatched / eventsObj.viewPercentage.totalTime) || 0;
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