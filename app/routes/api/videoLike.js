var VideoLikeCrud = require('../../persistence/crud/videoLike');

function VideoLike() {

}

VideoLike.prototype.post = function(req, res) {
  VideoLikeCrud
    .create(req.body)
    .then(function(like) {
      res.json({status: 'liked' });
    })
    .catch(function(err) {
      console.log(err);
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