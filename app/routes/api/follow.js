var FollowCrud = require('../../persistence/crud/follow');
var NotificationCrud = require('../../persistence/crud/notifications');
var socialCrud = require('../../persistence/crud/socialMediaAccount');
var Promise = require('bluebird');
var moment = require('moment');

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
      console.log(error);
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

function getFollowers(req, res) {
  var userId = req.query.userId;
  var skip = (req.query.skip) * 10;
  var sendArray = [];
  FollowCrud
    .getFollowers(userId, skip)
    .then(function(followers) {
      Promise.map(followers, function(follower) {
        console.log(follower.createdDate);
        follower.createdDate =  moment(follower.createdDate).format('MM-DD-YYYY');
        if (follower.userId) {
          return socialCrud.findByUserIdAndProvider(follower.userId._id, 'facebook')
            .then(function (social) {
              if (social && follower.userId.profilePicture === '') {
                follower.userId.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
              } else if (!social && follower.userId.profilePicture === '') {
                follower.userId.profilePicture = '/client/images/default.png';
              } else if (social && follower.userId.profilePicture.indexOf('facebook') > -1) {
                follower.userId.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
              } else if (follower.userId.profilePicture.indexOf('http') === -1 && follower.userId.profilePicture.indexOf('image/profile-picture') === -1 && follower.userId.profilePicture.indexOf('images/default.png') === -1) {
                follower.userId.profilePicture = '/api/image/profile-picture' + follower.userId.profilePicture + '?size=50';
              }
              return follower;
            })
            .then(function(follower) {
              console.log('post promise');
              console.log(follower.createdDate);
              sendArray.push(follower);
            })
        }
      })
      .then(function(){
        sendArray.sort(function(a,b) {
          if(a.createdDate < b.createdDate){
            return 1;
          }
          if(a.createdDate > b.createdDate){
            return -1;
          }
          return 0;
        });
      })
      .then(function() {
        res.send(sendArray);
      })
    })
    .catch(function(error) {
      res.sendStatus(500);
    })
}

function getFollowing(req, res) {
  var userId = req.query.userId;
  var skip = (req.query.skip) * 10;
  var sendArray = [];
  FollowCrud
    .getFollowing(userId, skip)
    .then(function(followers) {
      Promise.map(followers, function(follower) {
        console.log(follower.createdDate);
        follower.createdDate =  moment(follower.createdDate).format('MM-DD-YYYY');
        if (follower.followingUserId) {
          return socialCrud.findByUserIdAndProvider(follower.followingUserId._id, 'facebook')
            .then(function (social) {
              if (social && follower.followingUserId.profilePicture === '') {
                follower.followingUserId.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
              } else if (!social && follower.followingUserId.profilePicture === '') {
                follower.followingUserId.profilePicture = '/client/images/default.png';
              } else if (social && follower.followingUserId.profilePicture.indexOf('facebook') > -1) {
                follower.followingUserId.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
              } else if (follower.followingUserId.profilePicture.indexOf('http') === -1 && follower.followingUserId.profilePicture.indexOf('image/profile-picture') === -1 && follower.followingUserId.profilePicture.indexOf('images/default.png') === -1) {
                follower.followingUserId.profilePicture = '/api/image/profile-picture' + follower.followingUserId.profilePicture + '?size=50';
              }
              return follower;
            })
            .then(function(follower) {
              console.log('post promise');
              console.log(follower.createdDate);
              sendArray.push(follower);
            })
        }
      })
        .then(function(){
          sendArray.sort(function(a,b) {
            if(a.createdDate < b.createdDate){
              return 1;
            }
            if(a.createdDate > b.createdDate){
              return -1;
            }
            return 0;
          });
        })
        .then(function() {
          res.send(sendArray);
        })
    })
    .catch(function(error) {
      res.sendStatus(500);
    })
}

Follow.prototype.getCheckFollowing = getCheckFollowing;
Follow.prototype.post = post;
Follow.prototype.getFollowers = getFollowers;
Follow.prototype.getFollowing = getFollowing;

module.exports = new Follow();