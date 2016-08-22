try {
  var log4js = require('log4js');
  var logger = log4js.getLogger('app.persistence.crud.videosViews');
  var PersistenceException = require('../../utils/exceptions/PersistenceException');
  var ValidationException = require('../../utils/exceptions/ValidationException');
  var VideoViewModel = null;
  var database = require('../database/database');

  VideoViewModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.videoView"});
  logger.debug('loaded videoViews model');

  if(global.NODE_ENV === "production") {
    logger.setLevel("INFO");
  }

  logger.debug("import complete");
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var VideoView = function() {};

VideoView.prototype.create = function(params) {
  var videoViewModel = new VideoViewModel(params);
  return videoViewModel.save();
};

VideoView.prototype.findByUserId = function(id) {
  return VideoViewModel.find({ $or: [{userId: id}, {videoOwnerId: id}] }).exec();
};

VideoView.prototype.delete = function(id) {
  return VideoViewModel.findByIdAndRemove(id).exec();
};

VideoView.prototype.top100AllTime = function(startDate, endDate, limit) {
  return VideoViewModel.aggregate([
    {
      $match: {
        createdDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$videoId',
        video: {
          $last: '$videoId'
        },
        videoOwner: {
          $last: '$videoOwnerId'
        },
        count: {$sum: 1}
      }
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'video',
        foreignField: '_id',
        as: 'videoObject'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'videoOwner',
        foreignField: '_id',
        as: 'videoOwnerObject'
      }
    },
    {
      $unwind: {
        path: '$videoObject'
      }
    },
    {
      $unwind: {
        path: '$videoOwnerObject'
      }
    },
    {
      $project: {
        count: 1,
        videoObject: {title: 1, uploadDate: 1, categories: 1},
        videoOwnerObject: {userNameDisplay: 1}
      }
    },
    {
      $sort: {
        count: -1
      }
    },
    {
      $limit: limit
    }
  ])
};

module.exports = new VideoView();