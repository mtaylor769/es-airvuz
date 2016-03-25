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


module.exports = new Comment();