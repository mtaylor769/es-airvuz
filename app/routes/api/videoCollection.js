var videoCollectionCrud = require('../../persistence/crud/videoCollection');
var log4js              = require('log4js');
var logger              = log4js.getLogger('app.routes.api.videoCollection');

function VideoCollection() {
}

function getVideos(type) {
  return function (req, res) {
    videoCollectionCrud
      .getVideo(type)
      .then(function (videos) {
        res.json(videos);
      });
  }
}

function updateVideo(type) {
  return function (req, res) {
    return videoCollectionCrud
      .updateVideos(type, req.body.videos)
      .then(function () {
        res.json({});
      });
  }
}

VideoCollection.prototype.getVideos    = getVideos;
VideoCollection.prototype.updateVideo  = updateVideo;

module.exports = new VideoCollection();
