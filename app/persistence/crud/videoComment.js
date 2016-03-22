var VideoCommentModel   = require('../model/videoComment');
var mongoose					  = require('mongoose');

var VideoComment        = mongoose.model("VideoComment");

function videoComment() {

}

videoComment.prototype.create = function(params) {
  console.log("videoComment.create params: " + params);
  var videoCommentModel = new VideoComment();
  console.log('video model : ' + videoCommentModel);
  videoCommentModel.comment = params;
  console.log('video model with comment : ' + videoCommentModel);
  videoCommentModel.save(function(err, vidComment) {
    console.log("err: " + err);
    console.log(vidComment);
  })

};



module.exports = new videoComment();