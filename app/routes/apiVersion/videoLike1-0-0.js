var namespace = 'app.routes.apiVersion.videoLike1-0-0';
try {
    var log4js                  = require('log4js');
    var logger                  = log4js.getLogger(namespace);
    var videoLikeCrud1_0_0      = require('../../persistence/crud/videoLike1-0-0');
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
 * route: POST /api/video-like
 * @param req
 * @param res
 */
function post(req, res) {
  var json = JSON.parse(req.body.data);
  logger.debug(json);
  var like = json.like;
  var notification = json.notification;
  videoLikeCrud1_0_0
    .create(like)
    .then(function(like) {
      notificationCrud1_0_0.create(notification)
      .then(function(notification) {
        res.json({status: 'liked'})
      })
    })
    .catch(function(err) {
      logger.debug(err);
      if(err.likeId) {
        videoLikeCrud1_0_0
          .delete(err.likeId)
          .then(function(like) {
            res.json({ status: 'unliked' });
          })
      } else {
        res.sendStatus(500);
      }
    });
}

VideoLike.prototype.post = post;
module.exports = new VideoLike();