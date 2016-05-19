var Promise       = require('bluebird'),
    amazonConfig  = require('../config/amazon.config'),
    AWS           = require('aws-sdk'),
    crypto        = require('crypto'),
    probe         = require('node-ffprobe'),
    awsOptions    = {};

AWS.config.region       = 'us-west-2';
AWS.config.httpOptions  = {timeout: 7200000}; // 2 hr

awsOptions              = {
                            accessKeyId: amazonConfig.ACCESS_KEY,
                            secretAccessKey: amazonConfig.SECRET_KEY
                          };

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

  return new Promise(function (resolve, reject) {
    probe('https:' + URL_PATH + key, function(err, probeData) {
      if (err) {
        reject(err);
      }
      var duration = Math.floor(probeData.format.duration);
      var interval = Math.floor(duration / amazonConfig.NUMBER_OF_THUMBNAIL);

      // if interval is 0 then change it to 1
      presetParams.Thumbnails.Interval = (interval === 0 ? 1 : interval).toString();
      var transcoder = new AWS.ElasticTranscoder(awsOptions);
      transcoder.createPreset(presetParams, function (err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data.Preset.Id);
      });
    });
  })
}

function getVideoDuration(key) {
  return new Promise(function (resolve, reject) {
    probe('https:' + amazonConfig.INPUT_URL + key, function(err, probeData) {
      if (err) {
        reject(err);
      }
      var duration = Math.floor(probeData.format.duration);
      var min = duration / 60;
      var sec = min - Math.floor(min);

      sec = Math.floor(sec * 60);
      duration = Math.floor(min) < 9 || Math.floor(min) == 9 ? '0' + Math.floor(min) : Math.floor(min);
      duration += ':';
      duration += sec < 9 || sec == 9 ? '0' + sec : sec;

      resolve(duration);
    });
  });
}

function startTranscode(preset, key) {
  var transcoder = new AWS.ElasticTranscoder(awsOptions);
  var keyWithoutMp4 = key.replace('.mp4', '');

  return new Promise(function (resolve, reject) {
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
    transcoder.createJob(params, function (err, data) {
      if (err) {
        reject(err);
      }
    })
      .on('success', function (response) {
        resolve();
      });
  });
}

function deletePreset(preset) {
  var transcoder = new AWS.ElasticTranscoder(awsOptions);

  return new Promise(function (resolve, reject) {
    transcoder.deletePreset({Id: preset}, function (err, data) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * Get video URL and thumbnails
 * @param key
 * @returns {Promise} - {videoUrl, thumbnails}
 */
function listVideoObjects(key) {
  var bucket = new AWS.S3(awsOptions);

  return new Promise(function (resolve, reject) {
    bucket.listObjects({
      Bucket: amazonConfig.OUTPUT_BUCKET,
      EncodingType: 'url',
      Prefix: key
    }, function (err, response) {
      if (err) {
        return reject(err);
      }
      var videoUrl = '',
        thumbnails = [];

      response.Contents.forEach(function (content) {
        if (content.Key.indexOf('tn_') > 0) {
          thumbnails.push(content.Key);
        } else {
          videoUrl = content.Key;
        }
      });

      // limit the thumbnail to 6 only
      if (thumbnails.length > 6) {
        thumbnails.length = 6;
      }

      resolve({
        thumbnails: thumbnails,
        videoUrl: videoUrl
      });
    });
  });
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
  return new Promise(function (resolve, reject) {
    sns.confirmSubscription(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
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
  var bucket = new AWS.S3(awsOptions);

  return new Promise(function (resolve, reject) {
    bucket.copyObject({
      Bucket: params.dir,
      CopySource: 'airvuz-tmp/' + params.key,
      Key: params.newName || params.key,
      ACL: 'public-read'
    }, function (err, data) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

module.exports = {
  createPreset        : createPreset,
  getVideoDuration    : getVideoDuration,
  signAuth            : signAuth,
  startTranscode      : startTranscode,
  deletePreset        : deletePreset,
  listVideoObjects    : listVideoObjects,
  moveFile            : moveFile,

  // Middleware
  confirmSubscription : confirmSubscription,

  // expose the amazon config just so you don't have to require the service + config
  config              : amazonConfig
};