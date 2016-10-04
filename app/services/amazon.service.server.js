var Promise       = require('bluebird'),
    amazonConfig  = require('../config/amazon.config'),
    AWS           = require('aws-sdk'),
    crypto        = require('crypto'),
    probe         = require('node-ffprobe'),
    image         = require('./image.service.server'),
    fs            = require('fs'),
    request       = require('request'),
    awsOptions    = {
      accessKeyId: amazonConfig.ACCESS_KEY,
      secretAccessKey: amazonConfig.SECRET_KEY
    },
    log4js            = require('log4js'),
    logger            = log4js.getLogger('app.routes.api.amazon');

AWS.config.region = 'us-west-2';
AWS.config.setPromisesDependency(require('bluebird'));
AWS.config.httpOptions = {timeout: 7200000}; // 2 hr

function createPreset(key) {
  var URL_PATH      = amazonConfig.INPUT_URL;
  var presetParams  = {
    Name: key,
    Description: key,
    Container: 'mp4',
    Audio: {
      Codec: 'AAC',
      SampleRate: '48000',
      BitRate: '160',
      Channels: '2',
      AudioPackingMode: null,
      CodecOptions: {
        Profile: 'auto',
        BitDepth: null,
        BitOrder: null,
        Signed: null
      }
    },
    Video: {
      Codec: 'H.264',
      CodecOptions: {
        ColorSpaceConversionMode: 'None',
        InterlacedMode: 'Progressive',
        Level: '4.1',
        MaxReferenceFrames: '3',
        Profile: 'high'
      },
      KeyframesMaxDist: '90',
      FixedGOP: 'false',
      BitRate: 'auto',
      FrameRate: '30',
      MaxFrameRate: null,
      Resolution: null,
      AspectRatio: null,
      MaxWidth: '1336',
      MaxHeight: '750',
      DisplayAspectRatio: 'auto',
      SizingPolicy: 'ShrinkToFit',
      PaddingPolicy: 'NoPad'
    },
    Thumbnails: {
      Format: 'jpg',
      //Interval: '60', to be dynamic
      Resolution: null,
      AspectRatio: null,
      MaxWidth: '392',
      MaxHeight: '220',
      SizingPolicy: 'ShrinkToFit',
      PaddingPolicy: 'NoPad'
    }
  };

  return _probeVideo('https:' + URL_PATH + key)
    .then(function (probeData) {
      var duration = Math.floor(probeData.format.duration);
      var interval = Math.floor(duration / amazonConfig.NUMBER_OF_THUMBNAIL);

      // if interval is 0 then change it to 1
      presetParams.Thumbnails.Interval = (interval === 0 ? 1 : interval).toString();
      var transcoder = new AWS.ElasticTranscoder(awsOptions);

      return transcoder.createPreset(presetParams).promise()
        .then(function (data) {
          return data.Preset.Id
        });
    });
}

function _probeVideo(url) {
  return new Promise(function (resolve, reject) {
    probe(url, function (err, probeData) {
      if (err) {
        return reject(err);
      }
      resolve(probeData);
    });
  });
}

function getVideoDuration(key) {
  return _probeVideo('https:' + amazonConfig.INPUT_URL + key)
    .then(function (probeData) {
      var duration = Math.floor(probeData.format.duration);
      var min = duration / 60;
      var sec = min - Math.floor(min);

      sec = Math.floor(sec * 60);
      duration = Math.floor(min) < 9 || Math.floor(min) == 9 ? '0' + Math.floor(min) : Math.floor(min);
      duration += ':';
      duration += sec < 9 || sec == 9 ? '0' + sec : sec;

      return duration;
    });
}

function startTranscode(preset, key) {
  var transcoder = new AWS.ElasticTranscoder(awsOptions);
  var keyWithoutMp4 = key.replace('.mp4', '');
  var params = {
    Input: { Key: key },
    PipelineId: amazonConfig.PIPELINE_ID,
    Outputs: [
      {
        // generic 320x340
        Key: keyWithoutMp4 + '-100.mp4',
        ThumbnailPattern: '',
        PresetId: '1351620000001-000061'
      },
      {
        // generic 720p
        Key: keyWithoutMp4 + '-200.mp4',
        ThumbnailPattern: '',
        PresetId: '1351620000001-000010'
      },
      {
        // original-300
        Key: key,
        ThumbnailPattern: 'tn_{count}',
        PresetId: preset
      },
      {
        // generic 1080p
        Key: keyWithoutMp4 + '-400.mp4',
        ThumbnailPattern: '',
        PresetId: '1351620000001-000001'
      }
    ],
    OutputKeyPrefix: keyWithoutMp4 + '/'
  };

  return transcoder.createJob(params).promise();
}

function deletePreset(preset) {
  var transcoder = new AWS.ElasticTranscoder(awsOptions);

  return transcoder.deletePreset({Id: preset}).promise();
}

/**
 * Get video URL and thumbnails
 * @param key
 * @returns {Promise} - {videoUrl, thumbnails}
 */
function listVideoObjects(key) {
  var bucket = new AWS.S3(awsOptions);

  return bucket.listObjects({
    Bucket: amazonConfig.OUTPUT_BUCKET,
    EncodingType: 'url',
    Prefix: key
  }).promise()
    .then(function (response) {
      var videoUrl = '',
        thumbnails = [];

      response.Contents.forEach(function (content) {
        if (content.Key.indexOf('tn_') > 0) {
          thumbnails.push(content.Key);
        }
        // original transcode
        if (content.Key === key + '/' + key + '.mp4') {
          videoUrl = content.Key;
        }
      });

      // limit the thumbnail to 6 only
      if (thumbnails.length > 6) {
        thumbnails.length = 6;
      }

      return {
        thumbnails: thumbnails,
        videoUrl: videoUrl
      };
    });
}

/**
 * check to see if amazon have picture
 * @param path
 */
function hasImageSize(path) {
  var bucket = new AWS.S3(awsOptions),
      key = 'users/profile-pictures/resize/' + path;

  return new Promise(function (resolve, reject) {
    bucket.headObject({
      Bucket: amazonConfig.ASSET_BUCKET,
      Key: key
    }, function (err, response) {
      if (err) {
        if (err.code === 'NotFound') {
          return resolve(false);
        }
        return reject(err);
      }

      resolve({
        hasImage: true,
        fileName: path,
        path: amazonConfig.ASSET_URL + key
      });
    });
  });
}

function hasImage(bucket, key) {
  var s3 = new AWS.S3(awsOptions);

  return new Promise(function (resolve, reject) {
    s3.headObject({
      Bucket: bucket,
      Key: key
    }, function (err) {
      if (err) {
        if (err.code === 'NotFound') {
          return resolve(false);
        }
        return reject(err);
      }

      resolve(true);
    });
  });
}

function reSizeProfileImage(picture, size) {
  var resizePath = 'users/profile-pictures/resize/';
  var originalPath = 'users/profile-pictures/';
  var imagePath = amazonConfig.ASSET_URL + originalPath + picture;

  var readStream = request('https:' + imagePath);
  var stream = image.resize(readStream, size);

  var part = picture.split('.');
  var pictureWithoutExt = part[0];
  var sizeExt = '-' + size + 'x' + size + '.';
  var key =  resizePath + pictureWithoutExt + sizeExt + part[1];

  return uploadToS3(amazonConfig.ASSET_BUCKET, key, stream).then(function () {
    return {
      fileName: picture,
      path: amazonConfig.ASSET_URL + key
    };
  });
}

function reSizeThumbnailImage(params) {
  var readStream = request('https://s3-us-west-2.amazonaws.com/' + params.bucket + '/' + params.path);
  var stream = image.resize(readStream, params.size);
  return uploadToS3(params.bucket, params.newName, stream);
}

/**
 * Middleware to confirm amazon subscription
 * @param token
 * @param topicArn
 * @returns {Promise}
 */
function confirmSubscription(token, topicArn) {
  var sns = new AWS.SNS(awsOptions);
  var params = {
    Token: token,
    TopicArn: topicArn
  };

  return sns.confirmSubscription(params).promise();
}

/**
 * Sign an auth request to amazon server
 * @param toSign
 * @return {Promise}
 */
function signAuth(toSign) {
  var hash = crypto
              .createHmac('sha1', amazonConfig.SECRET_KEY)
              .update(toSign).digest('base64');

  return Promise.resolve(hash);
}

/**
 * use to move file in airvuz-tmp directory to another directory
 * @param {Object} params
 * @param {string} params.key - key in airvuz-temp
 * @param {string} params.dir - new path
 * @param {string} params.newName - default to key if doesn't exist
 */
function moveFile(params) {
  logger.debug(params);
  var bucket = new AWS.S3(awsOptions);

  return new Promise(function (resolve, reject) {
    bucket.copyObject({
      Bucket: params.dir,
      CopySource: 'airvuz-tmp/' + params.key,
      Key: params.newName || params.key,
      ACL: 'public-read'
    }, function (err, data) {
      if (err) {
        logger.error(err);
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * upload file to s3
 * @param bucket
 * @param key
 * @param body
 * @return {Promise}
 */
function uploadToS3(bucket, key, body) {
  var storage = new AWS.S3(awsOptions);
  var params = { Bucket: bucket, Key: key, Body: body, ACL: 'public-read' };

  return storage.upload(params).promise();
}

module.exports = {
  createPreset        : createPreset,
  getVideoDuration    : getVideoDuration,
  signAuth            : signAuth,
  startTranscode      : startTranscode,
  deletePreset        : deletePreset,
  listVideoObjects    : listVideoObjects,
  moveFile            : moveFile,
  uploadToS3          : uploadToS3,
  hasImageSize        : hasImageSize,
  hasImage            : hasImage,
  reSizeProfileImage  : reSizeProfileImage,
  reSizeThumbnailImage: reSizeThumbnailImage,
  // Middleware
  confirmSubscription : confirmSubscription,

  // expose the amazon config just so you don't have to require the service + config
  config              : amazonConfig
};