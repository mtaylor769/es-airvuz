var UploadCrud              = require('../../persistence/crud/upload');
var log4js                  = require('log4js');
var logger                  = log4js.getLogger('app.routes.api.upload');
var md5                     = require('md5');
var uuid                    = require('node-uuid');
var amazonService           = require('./../../../app/services/amazon.service.server');
var youtubedl               = require('youtube-dl');

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

function uploadExternalVideo(req, res) {
  var url = req.body.url;
  var fileName = md5(url + Date.now() + uuid.v1()) + '.mp4';
  var video = youtubedl(url, ['-f', 'best'], {});
  var promise;

  video.on('error', function () {
    if (promise.isPending()) {
      res.sendStatus(500);
    }
  });

  promise = amazonService.uploadVideoToS3({stream: video, fileName: fileName})
    .then(function (video) {
      // TODO: change to create new preset?
      // current using custom preset
      return amazonService.startTranscode('1463271020793-svwgsd', video)
        .then(function () {
          return video;
        });
    })
    .then(function (video) {
      res.json(video);
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
