var mongoose            = require('mongoose');
var schedule            = require('node-schedule');
var moment              = require('moment');
var VideoViewModel;
var trendingCron;

/**
 * Config
 */
var DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
var databaseOptions = {
  user: process.env.DATABASE_USER || '',
  pass: process.env.DATABASE_PASSWORD || '',
  auth: {
    authdb: 'admin'
  }
};

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://' + DATABASE_HOST + '/AirVuz2', databaseOptions);

VideoViewModel = mongoose.model('VideoView', require('./app/persistence/model/videoView').schema);

mongoose.connection.once('connected', start);

function generateTrendingCollection() {
  var twoWeekAgo = moment().subtract(14, 'days').toDate();

  return VideoViewModel.aggregate([
      {
        $match: {
          createdDate: {
            $gte: twoWeekAgo
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
        $out: "trendingvideos"
      }
    ])
    .exec()
    .then(function () {
      console.log('******************** generated trending videos collection ********************');
    })
    .catch(function (err) {
      console.log('******************** err ********************');
      console.log(err);
      console.log('************************************************');
    });
}

function start() {
  // initalize
  generateTrendingCollection();

  // schedule to re-run
  trendingCron = schedule.scheduleJob({hour: 24}, function () {
    console.log('******************** running ********************');
    generateTrendingCollection();
  });
}