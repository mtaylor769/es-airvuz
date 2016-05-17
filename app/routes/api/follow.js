var FollowCrud = require('../../persistence/crud/follow');
var NotificationCrud = require('../../persistence/crud/notifications');

function Follow() {

}

Follow.prototype.post = function(req, res) {
  console.log(req.body);
  var json = JSON.parse(req.body.data);
  console.log(json);
  var follow = json.follow;
  var notification = json.notification;
  FollowCrud
    .create(follow)
    .then(function(follow) {
      NotificationCrud.create(notification)
      .then(function(notification) {
        res.json({ status: 'followed' })
      })
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