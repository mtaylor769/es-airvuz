var VideoLikeCrud = require('../../persistence/crud/videoLike');
var NotificationCrud = require('../../persistence/crud/notifications')

function VideoLike() {

}

VideoLike.prototype.post = function(req, res) {
  var json = JSON.parse(req.body.data);
  logger.debug(json);
  var like = json.like;
  var notification = json.notification;
  VideoLikeCrud
    .create(like)
    .then(function(like) {
      NotificationCrud.create(notification)
      .then(function(notification) {
        res.json({status: 'liked'})
      })
    })
    .catch(function(err) {
      logger.debug(err);
      if(err.likeId) {
        VideoLikeCrud
          .delete(err.likeId)
          .then(function(like) {
            res.json({ status: 'unliked' });
          })
      } else {
        res.sendStatus(500);
      }
    });
};


module.exports = new VideoLike();