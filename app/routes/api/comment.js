var commentCrud = require('../../persistence/crud/comment');
var NotificationCrud = require('../../persistence/crud/notifications');
var Promise     = require('bluebird');
var mongoose    = require('mongoose');


function Comment() {

}

Comment.prototype.post = function(req, res) {
  var comment = req.body.comment;
  var notification = req.body.notification;

  commentCrud
    .create(comment)
    .then(function (comment) {
      console.log(comment);
      var parentCommentId = comment.parentCommentId;
      var videoId = comment.videoId;
      NotificationCrud.create(notification)
      .then(function(notification) {
        console.log(notification);
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
  console.log(req.query.parentId);
  commentCrud
  .getByParentCommentId(req.query.parentId)
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