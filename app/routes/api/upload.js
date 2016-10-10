var namespace = 'app.routes.api.upload';
try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var upload1_0_0 = require('../apiVersion/upload1-0-0');

    if (global.NODE_ENV === "production") {
      logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}
/**
 * returns an http 400 status along with "incorrect api version requested" to requster
 * displays remote address
 * @param req
 * @param res
 */
function incorrectVer(req, res) {
  logger.info("incorrect api version requested: " + req.query.apiVer +
      ", requester IP: " + req.connection.remoteAddress);
  res.status(400).json({error: "invalid api version"});
}

function Upload() {}

/*
 * If the request object query contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use defaultVer
 */
var defaultVer = "1.0.0";

function post(req, res) {

    var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    upload1_0_0.post(req, res);
  }
  else {
      incorrectVer(req,res);
  }
}

function getStatus(req, res, next) {

    var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    upload1_0_0.getStatus(req, res, next);
  }
  else {
      incorrectVer(req,res);
  }
}

function transcodeProgression(req, res) {

    var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    upload1_0_0.transcodeProgression(req, res);
  }
  else {
      incorrectVer(req,res);
  }
}

function transcodeCompletion(req, res) {

    var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    upload1_0_0.transcodeCompletion(req, res);
  }
  else {
      incorrectVer(req,res);
  }
}

function transcodeFailure(req, res) {

    var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    upload1_0_0.transcodeFailure(req, res);
  }
  else {
      incorrectVer(req,res);
  }
}

function transcodeWarning(req, res) {

    var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    upload1_0_0.transcodeWarning(req, res);
  }
  else {
      incorrectVer(req,res);
  }
}

function uploadExternalVideo(req, res) {

    var version = req.query.apiVer || defaultVer;

  if (version === "1.0.0") {
    upload1_0_0.uploadExternalVideo(req, res);
  }
  else {
      incorrectVer(req,res);
  }
}

Upload.prototype.post                     = post;
Upload.prototype.getStatus                = getStatus;
Upload.prototype.transcodeProgression     = transcodeProgression;
Upload.prototype.transcodeCompletion      = transcodeCompletion;
Upload.prototype.transcodeFailure         = transcodeFailure;
Upload.prototype.transcodeWarning         = transcodeWarning;
Upload.prototype.uploadExternalVideo      = uploadExternalVideo;

module.exports = new Upload();
