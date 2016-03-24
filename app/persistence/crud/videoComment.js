var VideoCommentModel   = require('../model/videoComment');
require('../../../mongoose');
var mongoose					  = require('mongoose');

var VideoComment        = mongoose.model('VideoComment');
var Comment             = mongoose.model("Comment");

function videoComment() {

}

videoComment.prototype.create = function(params) {
  var comment = new Comment(params);
  console.log(comment);
  comment.save()
  .then(function(comment) {
    console.log(comment);
    })
  });


};



module.exports = new videoComment();