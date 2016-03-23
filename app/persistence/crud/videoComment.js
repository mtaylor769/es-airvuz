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
    var videoCommentModel = new VideoComment();
    console.log('video model : ' + videoCommentModel);
    videoCommentModel.comment = comment._id;
    console.log('video model with comment : ' + videoCommentModel);
    videoCommentModel.save(function(err, vidComment) {
      console.log("err: " + err);
      console.log(vidComment);
    })
  });


};



module.exports = new videoComment();