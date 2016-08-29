var commentCrud       = require('../../persistence/crud/comment');
var NotificationCrud  = require('../../persistence/crud/notifications');
var socialCrud        = require('../../persistence/crud/socialMediaAccount');
var videoCrud         = require('../../persistence/crud/videos');
var log4js            = require('log4js');
var logger            = log4js.getLogger('app.routes.api.users');
var Promise           = require('bluebird');
var mongoose          = require('mongoose');
var moment            = require('moment');
var nodemailer        = require('nodemailer');


function Comment() {

}

Comment.prototype.post = function(req, res) {
  var json = JSON.parse(req.body.data);
  var comment = json.comment;
  var notification = json.notification;
  commentCrud
    .create(comment)
    .then(function (comment) {
      logger.debug(comment);
      var parentCommentId = comment.parentCommentId;
      var videoId = comment.videoId;
      notification.commentId = comment._id;
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

/**
 * transform comments to change date with moment and update profilePicture
 * @param comments
 * @private
 */
function _transformComments(comments) {
  return Promise.map(comments, function (comment) {
    comment.commentDisplayDate = moment(comment.commentCreatedDate).fromNow();
    if (comment.userId !== null) {
      return socialCrud.findByUserIdAndProvider(comment.userId._id, 'facebook')
        .then(function (social) {
          if (social && comment.userId.profilePicture === '') {
            comment.userId.profilePicture = '//graph.facebook.com/' + social.accountId + '/picture?type=small';
          } else if (!social && comment.userId.profilePicture === '') {
            comment.userId.profilePicture = '/client/images/default.png';
          } else if (social && comment.userId.profilePicture.indexOf('facebook') > -1) {
            comment.userId.profilePicture = '//graph.facebook.com/' + social.accountId + '/picture?type=small';
          } else if (comment.userId.profilePicture.indexOf('http') === -1 && comment.userId.profilePicture.indexOf('image/profile-picture') === -1 && comment.userId.profilePicture.indexOf('images/default.png') === -1) {
            comment.userId.profilePicture = '/api/image/profile-picture' + comment.userId.profilePicture + '?size=50';
          }
          return comment;
        });
    } else {
      comment.userId = {};
      comment.userId.profilePicture = '/client/images/default.png';
      return comment;
    }
  });
}

Comment.prototype.getByParentCommentId = function(req, res) {
  commentCrud
    .getByParentCommentId(req.query.parentId)
    .then(_transformComments)
    .then(function(comments) {
      res.send(comments);
    });
};

Comment.prototype.getByVideoId = function(req, res) {
  commentCrud
    .getParentCommentByVideoId({videoId: req.query.videoId, replyDepth: 0, page: req.query.page})
    .then(_transformComments)
    .then(function(comments) {
      res.json(comments);
    });
};

Comment.prototype.getById = function(req, res) {
  commentCrud
  .getById(req.params.id)
  .then(function(comment) {
    res.send(comment);
  })
};

Comment.prototype.put = function(req, res) {
  var notificationUpdate = {};
  notificationUpdate.notificationMessage = req.body.comment;
  NotificationCrud
    .getByComment(req.params.id)
    .then(function(notification) {
        if(notification.length) {
            return NotificationCrud.updateComment({id: notification[0]._id, update: notificationUpdate})
        } else {
            return;
        }
    })
    .then(function(notification) {
      logger.debug(notification);
      return commentCrud.update({id: req.params.id, update: req.body})
    })
    .then(function(comment) {
      res.send(comment);
    });
};

Comment.prototype.delete = function(req, res) {
    var reply;
  commentCrud.getById(req.params.id)
  .then(function(comment) {
      if(!comment.parentCommentId) {
        return commentCrud.getAllByParentComment(req.params.id)
      } else {
        reply = true;
        return comment;
      }
  })
  .then(function(comments) {
    if(typeof comments.length === 'undefined') {
        var removeObject = {};
        removeObject.removeCount = 1;
        removeObject.videoId = comments.videoId;
        return commentCrud.replyDecrease(comments.parentCommentId)
            .then(function() {
                return NotificationCrud.deleteByCommentId(comments._id)
            })
            .then(function() {
                return commentCrud.remove(comments._id);
            })
            .then(function() {
                return removeObject;
            })
    } else {
        var removeObject = {};
        removeObject.removeCount = comments.length;
        removeObject.videoId = comments[0].videoId;
        return Promise.map(comments, function(comment) {
            return NotificationCrud.deleteByCommentId(comment._id)
                .then(function() {
                    return commentCrud.remove(comment._id);
                })
        }).then(function() {
            return removeObject;
        })
    }
  })
  .then(function(removeObject) {
    videoCrud.getById(removeObject.videoId)
      .then(function(video) {
        var updateObject = {};
        updateObject.id = video._id;
        updateObject.update = {};
        updateObject.update.commentCount = video.commentCount - removeObject.removeCount;
        logger.error('this is the update object');
        logger.debug(updateObject);
        return videoCrud.updateVideoFieldCounts(updateObject);
      })
  })
  .then(function() {
      if(!reply) {
          var commentId = req.params.id;
          return NotificationCrud.delete(commentId);
      } else {
          return;
      }
  })
  .then(function() {
    res.sendStatus(200);
  })
  .catch(function(error) {
    logger.error(error);
    res.sendStatus(500);
  })
};

Comment.prototype.adminGetComments = function(req, res) {
    var videoId = req.query.videoId;
    return commentCrud.getByVideoIdShowUser(videoId)
        .then(function(comments) {
            return Promise.map(comments, function(comment) {
                return commentCrud.getByParentIdShowUser(comment._id)
                    .then(function(childComments) {
                        comment.childComments = childComments;
                        return comment;
                    })
            })
        })
        .then(function(comments) {
            res.send(comments);
        })
        .catch(function(error) {
            logger.error(error);
            res.sendStatus(500);
        })
};

Comment.prototype.reportComment = function(req, res) {
  var commentId = req.body.commentId;
  commentCrud
    .getById(commentId)
    .then(function(comment) {
      var transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user:'support@airvuz.com',
          pass:'b5&YGG6n'
        }
      });

      var mailOptions = {
        from:'noreply <noreply@airvuz.com>',
        to: 'support@airvuz.com',
        subject: 'Comment reported for video : ' + comment.videoId,
        html:'<p>A report has been submitted for comment Id : ' + comment._id + '.<br> Issue : Comment flagged for review <br> Comment Text :' + comment.comment + ' <br><a href="www.airvuz.com/video/' + comment.videoId+'"> Click here to go to video</a></p>'
      };

      transport.sendMail(mailOptions, function(error, message) {
        if(error) {
          res.sendStatus(400);
        } else {
          res.sendStatus(200);
        }
      })
    })
};


module.exports = new Comment();