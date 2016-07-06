/**
 * - code to run in production only
 *
 * Make sure to change the video models:
 * isResize: {
 *   type: Boolean,
 *   default: false
 * }
 *
 */
var mongoose = require('mongoose'),
  Promise = require('bluebird'),
  AWS = require('aws-sdk'),
  request = require('request'),
  gm = require('gm');


AWS.config.region = 'us-west-2';
AWS.config.httpOptions = {timeout: 3600000}; // 60 min

var awsOptions = {accessKeyId: 'AKIAIXDMGK4H4EX4BDOQ', secretAccessKey: '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'},
  Videos;

/**
 * Config
 */
var BATCH_COUNT = process.env.BATCH_COUNT || 20;
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

Videos = mongoose.model('Videos', require('../app/persistence/model/videos.js').schema);

function closeDatabaseConnection() {
  mongoose.connection.close();
  console.log('******************** close database connection ********************');
}

function getVideos() {
  // multiTranscode null are new video that has not been check yet
  var query = {thumbnailPath: /custom/, isResize: null};

  return Videos.find(query).sort({uploadDate: -1}).limit(BATCH_COUNT).exec();
}

function resizeThumbnail(videos) {
  return Promise.map(videos, function (video) {
    return new Promise(function (resolve, reject) {
      var readStream = request('http://s3-us-west-2.amazonaws.com/airvuz-drone-video/' + video.thumbnailPath);

      var stream = gm(readStream)
        .resize(392, 220)
        .stream();

      var storage = new AWS.S3(awsOptions);
      var params = { Bucket: 'airvuz-drone-video', Key: video.thumbnailPath, Body: stream, ACL: 'public-read' };

      storage.upload(params, function (err) {
        if (err) {
          console.log('******************** err upload ********************');
          console.log(err);
          console.log('************************************************');
          reject(err);
        } else {
          video.isResize = true;
          video.save(function () {
            resolve();
          });
        }
      });
    })
  });
}

mongoose.connection.once('connected', function () {
  getVideos()
    .then(resizeThumbnail)
    .catch(function (err) {
      console.log('******************** err ********************');
      console.log(err);
      console.log('************************************************');
    })
    .finally(closeDatabaseConnection);
});

