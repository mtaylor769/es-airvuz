'use strict';
try {
  var log4js                = require('log4js');
  var logger                = log4js.getLogger('app.persistance.crud.videoCollection');

  var database              = require('../database/database');
  var VideoCollectionModel  = database.getModelByDotPath({modelDotPath: 'app.persistence.model.videoCollection'});

} catch (exception) {
  logger.error(' import error:' + exception);
}

function VideoCollection() {}

function getVideo(type) {
  return VideoCollectionModel.findOne({name: type, user: null}).lean().exec()
    .then(function (videos) {
      if (videos) {
        return videos;
      }

      var newCollection = new VideoCollectionModel({name: type});

      return newCollection.save()
        .then(function (collection) {
          return collection;
        });
    });
}

function updateVideos(type, videos) {
  return VideoCollectionModel.findOneAndUpdate({name: type, user: null}, {videos: videos}).exec();
}

function getStaffPickVideos(count, page) {
  //var limit = count ? count : 10;
  //var skip = (page ? page : 1) * limit;

  return getVideoAndPopulate('Staff Pick Videos');
}

function getFeaturedVideos(count, page) {
  //var limit = count ? count : 10;
  //var skip = (page ? page : 1) * limit;

  return getVideoAndPopulate('Featured Videos');
}

function getVideoAndPopulate(type) {
  return VideoCollectionModel.findOne({name: type, user: null}).populate('videos').lean().exec()
    .then(function (collection) {
      if (collection) {
        return VideoCollectionModel.populate(collection, {path: 'videos.userId', model: 'Users'}).then(function (col) {
          if (col.length === 0) {
            return [];
          }
          // TODO: slice / limit / paging
          return col.videos;
        });
      } else {
        return [];
      }
    });
}

VideoCollection.prototype.getFeaturedVideos     = getFeaturedVideos;
VideoCollection.prototype.getStaffPickVideos    = getStaffPickVideos;
VideoCollection.prototype.getVideo              = getVideo;
VideoCollection.prototype.updateVideos          = updateVideos;

module.exports = new VideoCollection();
