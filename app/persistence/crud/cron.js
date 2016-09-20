try {
  var log4js = require('log4js');
  var logger = log4js.getLogger('app.persistence.crud.cron');
  var VideoViewModel = null;
  var database = require('../database/database');
  var moment = require('moment');

  VideoViewModel = database.getModelByDotPath({modelDotPath: 'app.persistence.model.videoView'});

  if(global.NODE_ENV === 'production') {
    logger.setLevel('INFO');
  }
}
catch(exception) {
  logger.error('import error: ' + exception);
}
var Cron = function (){};

function generateTrendingCollection() {
  var oneWeekAgo = moment().subtract(7, 'days').toDate();

  return VideoViewModel.aggregate([
    {
      $match: {
        createdDate: {
          $gte: oneWeekAgo
        }
      }
    },
    {
      $group: {
        _id: '$videoId',
        user: {
          $last: "$videoOwnerId"
        },
        count: {$sum: 1}
      }
    },
    {
      $sort: {
        count: -1
      }
    },
    {
      $out: 'trendingvideos'
    }
  ]).exec();
}

Cron.prototype.generateTrendingCollection = generateTrendingCollection;

module.exports = new Cron();