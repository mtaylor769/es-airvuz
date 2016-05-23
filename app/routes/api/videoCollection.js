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

function updateCollectionVideos(req, res) {
  var params = {};
  params.user = req.body.user;
  params.video = req.body.video;
  params.name = 'showcase';
  videoCollectionCrud
    .updateCollection(params)
    .then(function(video) {
      res.json({status: 'OK'});
    })
}

VideoCollection.prototype.getVideos    = getVideos;
VideoCollection.prototype.updateVideo  = updateVideo;
VideoCollection.prototype.updateCollectionVideos = updateCollectionVideos;

module.exports = new VideoCollection();
