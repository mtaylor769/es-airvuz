var VideoLikeCrud = require('../../persistence/crud/videoLike');

function VideoLike() {

}

VideoLike.prototype.post = function(req, res) {
  VideoLikeCrud
    .create(req.body)
    .then(function(like) {
      res.json(like);
    })
    .catch(function(err) {
      console.log(err);
      if(err === 'already liked') {
        res.send(err)
      } else {
        res.sendStatus(500);
      }
    });
};

VideoLike.prototype.delete = function(req, res) {
  VideoLikeCrud
  .delete(req.query.id)
  .then(function() {
    res.sendStatus(200);
  })
  .catch(function (err) {
    res.sendStatus(500);
  });
};


module.exports = new VideoLike();