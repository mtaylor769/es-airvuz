var UploadCrud              = require('../../persistence/crud/upload');
var log4js                  = require('log4js');
var logger                  = log4js.getLogger('app.routes.api.upload');
var md5                     = require('md5');
var uuid                    = require('node-uuid');
var amazonService           = require('./../../../app/services/amazon.service.server');
var youtubedl               = require('youtube-dl');
var _                       = require('lodash');

/**
 * Upload Route
 * @constructor
 */
function Upload() {}

/**
 * Start upload by creating a record
 * @param req
 * @param res
 */
function post(req, res) {
  var hashName = md5(Date.now() + req.body.file.name + uuid.v1());
  var params = {
    _id: hashName,
    file: req.body,
    //user: req.user._id,
    status: 'uploading',
    userAgent: req.headers['user-agent']
  };

  UploadCrud
    .createRecord(params)
    .then(function () {
      res.send(hashName);
    });
}

/**
 * get status of amazon video processing to see if it is complete or failure
 */
function getStatus(req, res, next) {
  UploadCrud
    .getStatus(req.params.id)
    .then(function (status) {
      if (status === 'completion') {
        // let the next middleware (amazon) handle the response
        return next();
      }
      if (status === 'failure') {
        return res.sendStatus(500);
      }
      return res.send('processing');
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

/**
 * Update update status state
 * @private
 * @param req
 * @param res
 * @param status
 */
function updateTranscodeStatus(req, res, status) {
  var id = 123; //req.body.id ?
  UploadCrud
    .updateTranscodeStatus(id, status)
    .then(function() {
      res.sendStatus(200);
    });
}

function transcodeProgression(req, res) {
  updateTranscodeStatus(req, res, 'processing');
}

function transcodeCompletion(req, res) {
  updateTranscodeStatus(req, res, 'completion');
}

function transcodeFailure(req, res) {
  updateTranscodeStatus(req, res, 'failure');
}

function transcodeWarning(req, res) {
  var id      = null; //req.body.id...
  var message = ''; // req.body...
  UploadCrud
    .updateMessageStatus(id, message)
    .then(function() {
      res.sendStatus(200);
    });
}

function _getVideoInfo(url) {
  return new Promise(function (resolve, reject) {
    youtubedl.getInfo(url, function (err, info) {
      if (err) {
        return reject(err);
      }
      resolve(info);
    });
  });
}

function _selectNonHlsBestQuality(video) {
  // filter only http and not hls
  // assuming that the quality is low to highest so we pop the last (best)
  return _.filter(video.formats, function (format) {
    return format.format_id.indexOf('hls') === -1;
  }).pop().format_id;
}

function _isVimeo(url) {
  return url.indexOf('vimeo.com') > -1;
}

function uploadExternalVideo(req, res) {
  var url = req.body.url;
  var fileName = md5(url + Date.now() + uuid.v1()) + '.mp4';
  var waitFor;
  var video;
  var promise;

  if (_isVimeo(url)) {
    waitFor = _getVideoInfo(url)
      .then(_selectNonHlsBestQuality);
  } else {
    waitFor = Promise.resolve('best');
  }

  promise = waitFor.then(function (quality) {
    video = youtubedl(url, ['-f', quality], {});

    video.on('error', function () {
      if (promise.isPending()) {
        res.sendStatus(500);
      }
    });

    return amazonService.uploadToS3(amazonService.config.INPUT_BUCKET, fileName, video);
  })
  .then(function () {
    // TODO: change to create new preset?
    // current using custom preset
    return amazonService.startTranscode('1463271020793-svwgsd', fileName)
  })
  .then(function () {
    res.json(fileName);
  })
  .catch(function () {
    res.sendStatus(500);
  });
}

Upload.prototype.post                     = post;
Upload.prototype.getStatus                = getStatus;
Upload.prototype.transcodeProgression     = transcodeProgression;
Upload.prototype.transcodeCompletion      = transcodeCompletion;
Upload.prototype.transcodeFailure         = transcodeFailure;
Upload.prototype.transcodeWarning         = transcodeWarning;
Upload.prototype.uploadExternalVideo      = uploadExternalVideo;

module.exports = new Upload();
