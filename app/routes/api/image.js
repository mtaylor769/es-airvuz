var request                 = require('request');
var amazonService           = require('../../services/amazon.service.server.js');

function Image() {}

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
      res.setHeader('content-disposition', 'attachment; filename=' + response.fileName);
      return request('https:' + response.path).pipe(res);
    })
    .catch(function (err) {
      res.sendStatus(500);
    });
}

function getVideoThumbnail(req, res, next) {
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
      resizeImageName,
      imagePath;

  originalImageName = part.join('/');
  // imagePath = 4136edf0907acb8754f9df86fa8f3456/tn_00002.jpg => 4136edf0907acb8754f9df86fa8f3456/tn_00002-226x127.jpg
  part2[0] += '-' + size.width + 'x' + size.height;
  resizeImageName = part2[0];
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
        res.setHeader('content-disposition', 'attachment; filename=' + resizeImageName);
        res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
        return request('https:' + amazonService.config.OUTPUT_URL + imagePath).pipe(res);
      })
      .catch(function (req, res) {
        res.sendStatus(500);
      });
}

function getSlide(req, res) {
  var videoPath = 'https:' + amazonService.config.ASSET_URL + 'slide/' + req.params.source;
  req.pipe(request(videoPath)).pipe(res);
}

Image.prototype.getProfilePicture = getProfilePicture;
Image.prototype.getVideoThumbnail = getVideoThumbnail;
Image.prototype.getSlide = getSlide;

module.exports = new Image();
