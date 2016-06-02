'use strict';
try {
  var log4js                = require('log4js');
  var logger                = log4js.getLogger('app.persistence.crud.videoCollection');
  var _                     = require('lodash');

  var database              = require('../database/database');
  var VideoCollectionModel  = database.getModelByDotPath({modelDotPath: 'app.persistence.model.videoCollection'});
  var moment                = require('moment');

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

function getStaffPickVideos() {
  return getVideoAndPopulate('Staff Pick Videos');
}

function getFeaturedVideos() {
  return getVideoAndPopulate('Featured Videos');
}

function getVideoAndPopulate(type) {
  return VideoCollectionModel.findOne({name: type, user: null}).populate('videos').lean().exec()
    .then(function (collection) {
      if (collection) {
        return VideoCollectionModel.populate(collection, {path: 'videos.userId', model: 'Users'}).then(function (col) {
          if (!col || col.length === 0) {
            return [];
          }
          // TODO: slice / limit / paging
          return col.videos.map(function (video) {
            video.uploadDate = moment(new Date(video.uploadDate)).fromNow();
            return video;
          });
        });
      } else {
        return [];
      }
    });
}

function createVideoCollection(params) {
  return(new Promise(function(resolve, reject) {
    return VideoCollectionModel.findOne({user: params.user, name: params.name}).populate('videos').exec()
      .then(function(videoCollection) {
        if(!videoCollection) {
          var videoCollectionModel = new VideoCollectionModel(params);
          videoCollectionModel.save(function(error, videoCollection) {
            if(error) {
              reject(error);
            } else {
              resolve(videoCollection);
            }
          });
        } else {
          return VideoCollectionModel.populate(videoCollection, {path: 'videos.userId', model: 'Users'}).then(function (col) {
            col.videos.map(function (video) {
              video.uploadDate = moment(new Date(video.uploadDate)).fromNow();
              return video;
            });

            resolve(videoCollection);
          });
        }
      });
    })
  );
}


function getCollectionVideos(userId, name) {
  return VideoCollectionModel.findOne({user: userId, name: name}).populate('videos').exec();
}

function updateCollection(params) {
  return VideoCollectionModel.findOne({user: params.user, name: params.name}).exec()
    .then(function(videoCollection) {
      var videoId = JSON.stringify(params.video);
      var videoCollectionString = JSON.stringify(videoCollection);
      var found = videoCollectionString.indexOf(videoId);
      logger.debug(found);
      if(found !== -1){
        return VideoCollectionModel.findOneAndUpdate({user: params.user, name: params.name}, {$pull: {videos: params.video}}, {safe: true}).exec();
      } else {
        return VideoCollectionModel.findOneAndUpdate({user: params.user, name: params.name}, {$push: {videos: params.video}}, {safe: true, upsert: true}).exec();
      }
    })
}

function addToCollectionVideos(userId, name, video) {
  return VideoCollectionModel.findOneAndUpdate({user: userId, name: name}, {$push: {videos: video}}, {safe: true, upsert: true}).exec();
}

function removeFromCollectionVideos(userId, name, video) {
  return VideoCollectionModel.findOneAndUpdate({user: userId, name: name}, {$pull: {videos: video}},{safe: true}).exec();
}

VideoCollection.prototype.getFeaturedVideos     = getFeaturedVideos;
VideoCollection.prototype.getStaffPickVideos    = getStaffPickVideos;
VideoCollection.prototype.getVideo              = getVideo;
VideoCollection.prototype.updateVideos          = updateVideos;
VideoCollection.prototype.getCollectionVideos   = getCollectionVideos;
VideoCollection.prototype.createVideoCollection = createVideoCollection;
VideoCollection.prototype.updateCollection      = updateCollection;

module.exports = new VideoCollection();
