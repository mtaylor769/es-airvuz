var UploadCrud              = require('../../persistence/crud/upload');
var log4js                  = require('log4js');
var logger                  = log4js.getLogger('app.routes.api.upload');
var md5                     = require('md5');
var uuid                    = require('node-uuid');
var amazonService           = require('./../../../app/services/amazon.service.server');
var youtubedl               = require('youtube-dl');
var findRemoveSync          = require('find-remove');

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

/**
 * use youtubedl native to download the best quality video
 * @param url
 * @param path
 * @returns {Promise}
 */
function downloadVideo(url, path) {
  return new Promise(function (resolve, reject) {
    youtubedl.exec(url, ['-f', 'best', '-o', path], {}, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function downloadExternalVideo(req, res) {
  var url = req.body.url;
  var fileName = md5(url + Date.now() + uuid.v1()) + '.mp4';
  var videoPath = '/tmp/' + fileName;

  return downloadVideo(url, videoPath)
    .then(function () {
      // return response back to the user to let them know trasncoding it starting
      // but it actually copying to s3 and transcoding
      res.json({fileName: fileName});
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
}

function externalTranscodeVideo(req, res) {
  var fileName = req.body.fileName;
  var videoPath = '/tmp/' + fileName;
  amazonService.copyVideoToS3({path: videoPath, fileName: fileName})
    .then(function (video) {
      // TODO: change to create new preset?
      // current using custom preset
      return amazonService.startTranscode('1454691097318-4731nu', video)
        .then(function () {
          return video;
        });
    })
    .then(function (video) {
      res.json(video);
    })
    .catch(function () {
      res.sendStatus(500);
    })
    .finally(function () {
      /**
       * remove the current upload temp file and remove file that is 4 hour old in the temp directory
       * - this is only if the server die and never remove the temp file
       */
      var results = findRemoveSync('/tmp', {files: videoPath, extensions: ['.mp4', '.mp4.part'], maxLevel: 1, age: {seconds: 14400}});
      logger.info('tmp file removed: ' + fileName);
      logger.info(results);
    });
}

Upload.prototype.post                     = post;
Upload.prototype.getStatus                = getStatus;
Upload.prototype.transcodeProgression     = transcodeProgression;
Upload.prototype.transcodeCompletion      = transcodeCompletion;
Upload.prototype.transcodeFailure         = transcodeFailure;
Upload.prototype.transcodeWarning         = transcodeWarning;
Upload.prototype.downloadExternalVideo    = downloadExternalVideo;
Upload.prototype.externalTranscodeVideo   = externalTranscodeVideo;

module.exports = new Upload();
