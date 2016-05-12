var FollowCrud = require('../../persistence/crud/follow');

function Follow() {

}

Follow.prototype.post = function(req, res) {
  FollowCrud
    .create(req.body)
    .then(function(follow) {
      res.json({ status: 'followed' })
    })
    .catch(function(err) {
      console.log(err);
      if(err.followId) {
        FollowCrud.delete(err.followId)
        .then(function(follow) {
          console.log(follow);
          res.json({ status: 'unfollowed' })
        })
      } else {
        res.send(500);
      }
    })
};


module.exports = new Follow();