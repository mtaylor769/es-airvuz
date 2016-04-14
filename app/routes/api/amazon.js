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
  amazonService.listVideoObjects(req.params.hash)
    .then(function (videoObjects) {
      res.json(videoObjects);
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
}

////////////////////////////////////////////

Amazon.prototype.signAuth        = signAuth;
Amazon.prototype.getVideoInfo    = getVideoInfo;

module.exports = new Amazon();

