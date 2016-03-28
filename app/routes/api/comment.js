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


module.exports = new Comment();