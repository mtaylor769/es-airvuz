var commentCrud = require('../../persistence/crud/comment');
var NotificationCrud = require('../../persistence/crud/notifications');
var socialCrud  = require('../../persistence/crud/socialMediaAccount');
var log4js                 = require('log4js');
var logger                 = log4js.getLogger('app.routes.api.users');
var Promise     = require('bluebird');
var mongoose    = require('mongoose');
var moment      = require('moment');


function Comment() {

}

Comment.prototype.post = function(req, res) {
  var json = JSON.parse(req.body.data);
  var comment = json.comment;
  var notification = json.notification;
  commentCrud
    .create(comment)
    .then(function (comment) {
      var parentCommentId = comment.parentCommentId;
      var videoId = comment.videoId;
      NotificationCrud.create(notification)
      .then(function(notification) {
      });
      commentCrud.replyIncrement(parentCommentId, videoId);
      res.send(comment);
    })
    .catch(function(error) {
    });
};

Comment.prototype.get = function(req, res) {
  commentCrud
  .get()
  .then(function(comments) {
    res.send(comments)
  })
};

Comment.prototype.getByParentCommentId = function(req, res) {
  logger.debug(req.query.parentId);
  commentCrud
  .getByParentCommentId(req.query.parentId)
  .then(function(comments) {
    return Promise.map(comments, function (comment) {
      console.log(comment);
      comment.commentDisplayDate = moment(comment.commentCreatedDate).fromNow();
      if (comment.userId !== null) {
        return socialCrud.findByUserIdAndProvider(comment.userId._id, 'facebook')
          .then(function (social) {
            logger.debug(social);
            if (social && comment.userId.profilePicture === '') {
              comment.userId.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
              return comment;
            } else if (!social && comment.userId.profilePicture === '') {
              comment.userId.profilePicture = '/client/images/default.png';
              return comment;
            } else if (social && comment.userId.profilePicture.indexOf('facebook') > -1) {
              comment.userId.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
              return comment;
            } else if (comment.userId.profilePicture.indexOf('http') === -1 && comment.userId.profilePicture.indexOf('users/profile-pictures') === -1) {
              comment.userId.profilePicture = '/api/image/profile-picture' + comment.userId.profilePicture + '?size=50';
              return comment;
            } else {
              comment.userId.profilePicture = comment.userId.profilePicture;
              return comment;
            }
          })
      } else {
        comment.userId = {};
        comment.userId.profilePicture = '/client/images/default.png';
        return comment;
      }
    })
  })
  .then(function(comments) {
    res.send(comments);
  })
};

Comment.prototype.getByVideoId = function(req, res) {
  var videoId = mongoose.Types.ObjectId(req.query.videoId);
  commentCrud
  .getParentCommentByVideoId({videoId: videoId, replyDepth: 0})
  .then(function(comments) {
    res.json(comments);
  })
};

Comment.prototype.getById = function(req, res) {
  commentCrud
  .getById(req.params.id)
  .then(function(comment) {
    res.send(comment);
  })
};

Comment.prototype.put = function(req, res) {
  commentCrud
  .update({id: req.body._id, update: req.body})
  .then(function(comment) {
    res.send(comment);
  })
};

Comment.prototype.delete = function(req, res) {
  commentCrud
  .remove(req.params.id)
  .then(function() {
    res.sendStatus(200);
  })
};


module.exports = new Comment();