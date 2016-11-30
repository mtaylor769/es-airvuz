var namespace = 'app.routes.apiVersion.videoLike1-0-0';
try {
    var log4js                  = require('log4js');
    var logger                  = log4js.getLogger(namespace);
    var videoLikeCrud1_0_0      = require('../../persistence/crud/videoLike1-0-0');
    var videosCrud1_0_0         = require('../../persistence/crud/videos1-0-0');
    var notificationCrud1_0_0   = require('../../persistence/crud/notifications1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

function VideoLike() {

}
/**
 * route: POST /api/videos/:id/like
 * @param req
 * @param res
 */
function post(req, res) {
  var currentVideoId = req.params.id;

  videosCrud1_0_0.getById(currentVideoId)
    .then(function (currentVideo) {
      var like = {
          videoId: currentVideoId,
          userId: req.user._id,
          videoOwnerId: currentVideo.userId
        },
        notification = {
          notificationType: 'LIKE',
          notifiedUserId: currentVideo.userId,
          notificationMessage: 'liked your video',
          videoId: currentVideoId,
          actionUserId: req.user._id
        };

      return videoLikeCrud1_0_0
        .create(like)
        .then(function () {
          notificationCrud1_0_0.create(notification)
            .then(function () {
              res.json({status: 'liked'})
            })
        });
    })
    .catch(function (err) {
      if (err.likeId) {
        videoLikeCrud1_0_0
          .delete(err.likeId)
          .then(function () {
            res.status(200).json({status: 'unliked'});
          })
      } else {
        res.sendStatus(500);
      }
    });
}

VideoLike.prototype.post = post;
module.exports = new VideoLike();