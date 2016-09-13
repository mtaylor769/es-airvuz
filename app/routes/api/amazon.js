var amazonService = require('../../services/amazon.service.server.js');

/**
 * Amazon Route
 * @constructor
 */
function Amazon() {}

function signAuth(req, res) {
  amazonService.signAuth(req.query.to_sign)
    .then(function (signRequest) {
      res.send(signRequest);
    });
}

function getVideoInfo(req, res) {
  amazonService.listVideoObjects(req.params.id)
    .then(function (videoObjects) {

      /**
       * quick hack for local uploading
       */
      if (videoObjects.videoUrl && videoObjects.thumbnails.length > 0) {
        return res.json(videoObjects);
      }
      return res.send('processing');

      //////////

      //return res.json(videoObjects);
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
}

function startTranscode(req, res) {
  var preset;

  amazonService.createPreset(req.body.key + '.mp4')
    .then(function (newPreset) {
      preset = newPreset;
      return amazonService.startTranscode(newPreset, req.body.key + '.mp4');
    })
    .then(function () {
      res.send('video is processing');
    })
    .catch(function (err) {
      res.status(500).send(err);
    })
    .finally(function () {
      if (preset) {
        amazonService.deletePreset(preset).done();
      }
    });
}

function getVideoDuration(req, res) {
  amazonService.getVideoDuration(req.query.key + '.mp4')
    .then(function (duration) {
      res.send(duration);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

function moveFile(req, res) {
  amazonService.moveFile(req.body)
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}

////////////////////////////////////////////

Amazon.prototype.signAuth               = signAuth;
Amazon.prototype.getVideoInfo           = getVideoInfo;
Amazon.prototype.confirmSubscription    = amazonService.confirmSubscription;
Amazon.prototype.startTranscode         = startTranscode;
Amazon.prototype.getVideoDuration       = getVideoDuration;
Amazon.prototype.moveFile               = moveFile;

module.exports = new Amazon();

