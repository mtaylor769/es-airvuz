var namespace = 'app.routes.apiVersion.image1-0-0';
try {
    var log4js          = require('log4js');
    var logger          = log4js.getLogger(namespace);
    var request         = require('request');
    var amazonService   = require('../../services/amazon.service.server.js');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

/**
 *
 * @constructor
 */
function Image() {}
/**
 * get the profile image for the user from amazon
 * set the size to the value in query parameter
 * route: GET /image/profile-picture/:picture
 * @param req
 * @param res
 */
function getProfilePicture(req, res) {
  var availableSize = {
    50: true,
    200: true
  };

  var size = req.query.size;

  if (!(size in availableSize)) {
    size = 50;
  }
  var part = req.params.picture.split('.');
  // 2adf3sdf-50x50.jpg
  var picture = part[0] + '-' + size + 'x' + size + '.' + part[1];

  amazonService.hasImageSize(picture)
    .then(function (response) {
      if (response && response.hasImage) {
        return response;
      }
      return amazonService.reSizeProfileImage(req.params.picture, size);
    })
    .then(function (response) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
      req.pipe(request('https:' + response.path)).pipe(res);
    })
    .catch(function () {
      res.sendStatus(500);
    });
}
/**
 * route: GET /image/drone-video-thumbnail/:id/:source
 * @param req
 * @param res
 */
function proxyThumbnail(req, res) {
  var videoPath = 'https:' + amazonService.config.OUTPUT_URL + req.params.id + '/' + req.params.source;
  req.pipe(request(videoPath)).pipe(res);
}
/**
 * get the thumbnail image for the video from amazon
 * route: GET /image/drone-video-thumbnail
 * @param req
 * @param res
 * @returns {*}
 */
function getVideoThumbnail(req, res) {
  if (!req.query.image) {
    return res.status(400).send('required image');
  }

  var size = {
        width: req.query.w || '226',
        height: req.query.h || '127'
      },
      part = req.query.image.split('/'),
      bucket = part.shift(),
      part2 = part[1].split('.'),
      originalImageName,
      imagePath;

  originalImageName = part.join('/');
  // imagePath = 4136edf0907acb8754f9df86fa8f3456/tn_00002.jpg => 4136edf0907acb8754f9df86fa8f3456/tn_00002-226x127.jpg
  part2[0] += '-' + size.width + 'x' + size.height;
  part[1] = part2.join('.');
  imagePath = part.join('/');

  amazonService.hasImage(bucket, imagePath)
      .then(function (hasResizeImage) {
        if (hasResizeImage) {
          return true;
        }
        return amazonService.reSizeThumbnailImage({
          bucket: bucket,
          path: originalImageName,
          newName: imagePath,
          size: size
        });
      })
      .then(function () {
        res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
        req.pipe(request('https:' + amazonService.config.OUTPUT_URL + imagePath)).pipe(res);
      })
      .catch(function () {
        res.sendStatus(500);
      });
}
/**
 * route: GET /image/slide/:source
 * @param req
 * @param res
 */
function getSlide(req, res) {
  var videoPath = 'https:' + amazonService.config.ASSET_URL + 'slide/' + req.params.source;
  req.pipe(request(videoPath)).pipe(res);
}

Image.prototype.getProfilePicture = getProfilePicture;
Image.prototype.getVideoThumbnail = getVideoThumbnail;
Image.prototype.getSlide = getSlide;
Image.prototype.proxyThumbnail = proxyThumbnail;

module.exports = new Image();
