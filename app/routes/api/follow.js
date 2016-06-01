var FollowCrud = require('../../persistence/crud/follow');
var NotificationCrud = require('../../persistence/crud/notifications');

function Follow() {}

function getCheckFollowing(req, res) {
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
            res.json({ status: 'unfollowed'});
          })
      } else {
        res.send(500);
      }
    });
}

function post(req, res) {
  var json = JSON.parse(req.body.data);
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
      if(err.followId) {
        FollowCrud.delete(err.followId)
          .then(function(follow) {
            res.json({ status: 'unfollowed' });
          })
      } else {
        res.send(500);
      }
    });
}

Follow.prototype.getCheckFollowing = getCheckFollowing;
Follow.prototype.post = post;

module.exports = new Follow();