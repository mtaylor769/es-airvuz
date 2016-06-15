var _                       = require('lodash');
var Promise                 = require('bluebird');
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
        console.log('******************** hasImage ********************');
        console.log(response);
        console.log('************************************************');
        return response;
      }
      return amazonService.reSizeImage(req.params.picture, size);
    })
    .then(function (response) {
      res.setHeader('content-disposition', 'attachment; filename=' + response.fileName);
      return request('https:' + response.path).pipe(res);
    })
    .catch(function (err) {
      console.log('******************** err ********************');
      console.log(err);
      console.log('************************************************');
      res.sendStatus(500);
    });

  // res.sendStatus(200);
}



Image.prototype.getProfilePicture         = getProfilePicture;

module.exports = new Image();
