var namespace = 'app.routes.apiVersion.upload1-0-0';
try {
    var log4js                  = require('log4js');
    var logger                  = log4js.getLogger(namespace);
    var UploadCrud              = require('../../persistence/crud/upload');
    var md5                     = require('md5');
    var uuid                    = require('node-uuid');
    var amazonService           = require('./../../../app/services/amazon.service.server');
    var youtubedl               = require('youtube-dl');
    var _                       = require('lodash');
    var youtubedlOption         = {maxBuffer: 1024 * 1000}; // 1mb

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}


/**
 * Upload Route
 * @constructor
 */
function Upload() {}

/**
 * Start upload by creating a record
 * route: PROTECTED POST /api/upload
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
 * route: GET /api/upload/:id - the current route definition does not call this function
 * @param req
 * @param res
 * @param next
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
/**
 * route: POST /api/amazon/transcode/progression
 * @param req
 * @param res
 */
function transcodeProgression(req, res) {
  updateTranscodeStatus(req, res, 'processing');
}
/**
 * route: POST /api/amazon/transcode/completion
 * @param req
 * @param res
 */
function transcodeCompletion(req, res) {
  updateTranscodeStatus(req, res, 'completion');
}
/**
 * route: POST /api/amazon/transcode/failure
 * @param req
 * @param res
 */
function transcodeFailure(req, res) {
  updateTranscodeStatus(req, res, 'failure');
}
/**
 * route: POST /api/amazon/transcode/warning
 * @param req
 * @param res
 */
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
 *
 * @param url
 * @returns {Promise}
 * @private
 */
function _getVideoInfo(url) {
  return new Promise(function (resolve, reject) {
    youtubedl.getInfo(url, [], youtubedlOption, function (err, info) {
      if (err) {
        return reject(err);
      }
      resolve(info);
    });
  });
}

/**
 * select best quality for vimeo
 * - hls format doesn't work (http live streaming - streaming communications protocol by Apple)
 * - original format doesn't work (original only show up for recent upload)
 * @param video
 * @returns {string} - format
 * @private
 */
function _selectBestQualityForVimeo(video) {
  var isHttp;
  // filter only http format
  // no hls and original format
  // assuming that the quality is low to highest so we pop the last (best)
  return _.filter(video.formats, function (format) {
    isHttp = format.format_id.indexOf('http') > -1;

    return isHttp;
  }).pop().format_id;
}
/**
 *
 * @param url
 * @returns {boolean}
 * @private
 */
function _isVimeo(url) {
  return url.indexOf('vimeo.com') > -1;
}
/**
 *
 * @param req
 * @param res
 */
function uploadExternalVideo(req, res) {
  req.setTimeout(0);
  var url = req.body.url;
  var fileName = md5(url + Date.now() + uuid.v1()) + '.mp4';
  var waitFor;
  var video;

  if (_isVimeo(url)) {
    waitFor = _getVideoInfo(url)
      .then(_selectBestQualityForVimeo);
  } else {
    waitFor = Promise.resolve('best');
  }

  waitFor.then(function (quality) {
    video = youtubedl(url, ['-f', quality], youtubedlOption);

    video.on('error', function () {
      throw 'Youtubedl error';
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
