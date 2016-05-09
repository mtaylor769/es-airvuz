var FollowCrud = require('../../persistence/crud/follow');

function Follow() {

}

Follow.prototype.post = function(req, res) {
  FollowCrud
    .create(req.body)
    .then(function(follow) {
      res.json(follow)
    })
    .catch(function(err) {
      if(err === 'already following') {
        res.send(err);
      } else {
        res.send(500);
      }
    })
};


module.exports = new Follow();