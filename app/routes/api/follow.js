var FollowCrud = require('../../persistence/crud/follow');
var NotificationCrud = require('../../persistence/crud/notifications');

function Follow() {

}

Follow.prototype.getCheckFollowing = function(req, res) {
  var data = req.body;
  FollowCrud
    .followCheck(data)
    .then(function(follow){
      if (follow) {
        res.json({ status: 'followed' });
      } else {
        res.json({ status: 'unfollowed'});
      }
    })
    .error(function(error){
      if(error.followId) {
        FollowCrud.delete(error.followId)
          .then(function(follow) {
            console.log(follow);
            res.json({ status: 'unfollowed'});
          })
      } else {
        res.send(500);
      }
    });
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
        res.json({ status: 'followed' });
      })
    })
    .catch(function(err) {
      console.log(err);
      if(err.followId) {
        FollowCrud.delete(err.followId)
        .then(function(follow) {
          console.log(follow);
          res.json({ status: 'unfollowed' });
        })
      } else {
        res.send(500);
      }
    })
};


module.exports = new Follow();