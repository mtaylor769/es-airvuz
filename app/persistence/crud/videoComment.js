var comment = require('../../');
var VideoCommentModel = require('../model/videoComment');

function something(params) {


  var videoComment = VideoCommentModel;
  videoComment.save(function(err, vidComment) {
    console.log(vidComment);
  })

}

something(comment);


module.exports = new something();