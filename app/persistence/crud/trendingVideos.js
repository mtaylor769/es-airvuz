try {
  var moment = require('moment');
  var log4js = require('log4js');
  var logger = log4js.getLogger('app.persistence.crud.videosViews');
  var TrendingVideoModel = null;
  var database = require('../database/database');

  TrendingVideoModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.trendingVideos"});
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var TrendingVideos = function() {};

function getVideos(params) {
  if (!params) {
    params = {
      total: 30,
      page: 1
    }
  }

  var limit = params.total;
  var skip = (params.page - 1) * limit;
  return TrendingVideoModel
    .find()
    .sort('-count')
    .skip(skip)
    .limit(limit)
    .populate('_id')
    .populate('user')
    .lean()
    .exec()
    .then(function (videos) {
      var existsVideo = [];

      videos.forEach(function (video) {
        if (video._id) {
          video._id.userId = video.user;
          video._id.uploadDate = moment(new Date(video._id.uploadDate)).fromNow();
          existsVideo.push(video._id);
        }
      });

      return existsVideo;
    });
}

TrendingVideos.prototype.getVideos = getVideos;

module.exports = new TrendingVideos();