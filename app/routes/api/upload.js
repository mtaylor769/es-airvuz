var UploadCrud              = require('../../persistence/crud/upload');
var log4js                 = require('log4js');
var logger                 = log4js.getLogger('app.routes.api.upload');

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
  UploadCrud
    .createRecord(req.params)
    .then(function (user) {
      res.send(user);
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

Upload.prototype.post                 = post;
Upload.prototype.getStatus            = getStatus;
Upload.prototype.transcodeProgression = transcodeProgression;
Upload.prototype.transcodeCompletion  = transcodeCompletion;
Upload.prototype.transcodeFailure     = transcodeFailure;
Upload.prototype.transcodeWarning     = transcodeWarning;

module.exports = new Upload();
