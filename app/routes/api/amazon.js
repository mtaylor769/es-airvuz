var amazonService = require('../../services/amazon.service.server.js');

/**
 * Amazon Route
 * @constructor
 */
function Amazon() {}

function signAuth(req, res) {
  amazonService.signAuth(req.query.to_sign)
    .then(res.send);
}

function getVideoInfo(req, res) {
  amazonService.listVideoObjects(req.params.id)
    .then(function (videoObjects) {

      /**
       * quick hack for local uploading
       */
      if (videoObjects.videoUrl) {
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

////////////////////////////////////////////

Amazon.prototype.signAuth               = signAuth;
Amazon.prototype.getVideoInfo           = getVideoInfo;
Amazon.prototype.confirmSubscription    = amazonService.confirmSubscription;
Amazon.prototype.startTranscode         = startTranscode;

module.exports = new Amazon();

