var commentCrud = require('../../persistence/crud/comment');


function Comment() {

}

Comment.prototype.post = function(req, res) {
  commentCrud
  .create(req.body)
  .then(function(comment) {
    res.send(comment);
  })
};

Comment.prototype.get = function(req, res) {
  commentCrud
  .get()
  .then(function(comments) {
    res.send(comments)
  })
};

Comment.prototype.getByParentCommentId = function(req, res) {
  console.log(req.body.parentId);
  commentCrud
  .getByParentCommentId(req.body.parentId)
  .then(function(comments) {
    res.send(comments);
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