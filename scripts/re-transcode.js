#!/usr/bin/env node
/**
 * Run at the root /AirVuz
 * - sudo node scripts/re-transcode.js
 * - NODE_ENV
 * - BATCH_COUNT
 * - DATABASE_USER
 * - DATABASE_PASSWORD
 * - VIDEO_ID
 * 
 * * INFO: make sure video modal have multiTranscode field
 */
console.log('******************** Multi Transcode ********************');

var mongoose = require('mongoose'),
  Promise = require('bluebird'),
  AWS = require('aws-sdk');

AWS.config.region = 'us-west-2';
AWS.config.httpOptions = {timeout: 3600000}; // 60 min

var INPUT_BUCKET, OUTPUT_BUCKET, PIPELINE_ID;

if (process.env.NODE_ENV === 'production') {
  INPUT_BUCKET  = 'airvuz-drone-video-input';
  OUTPUT_BUCKET = 'airvuz-drone-video';
  PIPELINE_ID   = '1455744809087-s0jcq3';
} else {
  INPUT_BUCKET  = 'airvuz-videos-beta-input';
  OUTPUT_BUCKET = 'airvuz-videos-beta';
  PIPELINE_ID   = '1452901546045-62g3bq';
}

var awsOptions = {accessKeyId: 'AKIAIXDMGK4H4EX4BDOQ', secretAccessKey: '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'},
  Videos;

/**
 * Config
 */
var BATCH_COUNT = process.env.BATCH_COUNT || 50;
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
  var query = {multiTranscode: false};

  // used to try running a video again
  if (process.env.VIDEO_ID) {
    query = {
      _id: process.env.VIDEO_ID
    };
  }

  return Videos.find(query).sort({UploadDate: process.env.REVERSE || -1}).limit(BATCH_COUNT).exec();
}

function createTranscodeJob(videos) {
  console.log('******************** TRANSCODING ********************');
  return Promise.map(videos, function (video, index) {
    console.log('******************** transcoding ' + index);
    var coder = new AWS.ElasticTranscoder(awsOptions);
    var fileName = video.videoPath.split('/')[1];
    var fileNameWithoutMp4 = fileName.replace('.mp4', '');

    return new Promise(function (resolve, reject) {
      var params = {
        Input: { Key: fileName },
        PipelineId: PIPELINE_ID,
        Outputs: [
          {
            // generic 320x340
            Key: fileNameWithoutMp4 + '-100.mp4',
            ThumbnailPattern: '',
            PresetId: '1351620000001-000061'
          },
          {
            // generic 720p
            Key: fileNameWithoutMp4 + '-200.mp4',
            ThumbnailPattern: '',
            PresetId: '1351620000001-000010'
          },
          // -300 is original
          {
            // generic 1080p
            Key: fileNameWithoutMp4 + '-400.mp4',
            ThumbnailPattern: '',
            PresetId: '1351620000001-000001'
          }
        ],
        OutputKeyPrefix: fileNameWithoutMp4 + '/'
      };
      coder.createJob(params, function (err, data) {
        if (err) {
          return reject(err);
        }
      })
        .on('success', function (response) {
          var transcoder = new AWS.ElasticTranscoder(awsOptions);
          var jobId = response.data.Job.Id;
          transcoder.waitFor('jobComplete', {Id: jobId}, function (err, data) {
            if (err) {
              video.multiTranscode = false;
              console.log('********************Fail ' + index + ' : video._id ********************');
              console.log(video._id);
              console.log(video.videoPath);
              console.log('************************************************');
              video.save(function () {
                resolve(video);
              })
                .catch(function (err) {
                  console.log('******************** err ********************');
                  console.log(err);
                  console.log('************************************************');
                });
              return;
            }
            console.log('******************** done transcoding ' + index);
            video.multiTranscode = true;
            video.save(function () {
              resolve(video);
            });
          });
        });
    })
  });
}

function onComplete(videos) {
  return Promise.map(videos, function (video) {
    video.multiTranscode = true;
    return video.save();
  });
}

function hasMultiTranscode(video) {
  return new Promise(function (resolve) {
    var storage = new AWS.S3(awsOptions);
    var hashName = video.videoPath.split('/')[0];
    var params = {
      Bucket: OUTPUT_BUCKET,
      Prefix: hashName
    };

    storage.listObjects(params, function (err, bucket) {
      if (!err) {
        var videos = bucket.Contents.filter(function (obj) {
          return /.+\.mp4$/.test(obj.Key);
        }).map(function (obj) {
          return obj.Key;
        });

        if (videos.length !== 4) {
          // video doesn't have multi transcode
          console.log('******************** videos ********************');
          console.log(video._id + ": doesn't have multi transcode (" + videos.length + ")");
          console.log(videos);
          console.log('************************************************');
          // video doesn't
          video.multiTranscode = false;
          video.save()
            .then(function () {
              resolve(true);
            })
            .catch(function (err) {
              console.log('******************** err ********************');
              console.log(err);
              console.log('************************************************');
              resolve(true);
            });
        } else {
          // video does
          video.multiTranscode = true;
          video.save()
            .then(function () {
              resolve(false);
            })
            .catch(function (err) {
              console.log('******************** err ********************');
              console.log(err);
              console.log('************************************************');
              resolve(false);
            });
        }
      }
    });
  });
}

mongoose.connection.once('connected', function () {
  getVideos()
    .then(function (videos) {
      return Promise.filter(videos, function (video) {
        return hasMultiTranscode(video);
      })
    })
    // .then(createTranscodeJob)
    .catch(function (err) {
      console.log('******************** err ********************');
      console.log(err);
      console.log('************************************************');
    })
    .finally(closeDatabaseConnection);
});

