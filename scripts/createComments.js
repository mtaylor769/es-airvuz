var comment = require('../test/mockObjects/comment');
var commentCrud = require('../app/persistence/crud/comment');
var log4js											= require('log4js');
var logger											= log4js.getLogger();
var mongoose = require('../mongoose');
var videoId = '56e861e9d973c0db2e2705e5';
var parentCount = 3;
var childCount = 3;

comment.videoId = videoId;

var parentNoChild = parentCount;

logger.debug('entering parent no child create');

for(var i = 0; i < parentNoChild; i++) {
  commentCrud.create(comment);
}

logger.debug('exiting parent with child create');

var parentWithChild = 1;

logger.debug('entering parent with child create');

for(var i = 0; i < parentWithChild; i++) {
  commentCrud.create(comment)
  .then(function(comment) {

    logger.debug('exiting parent with child create');

    logger.debug('entering child create');

    for(var j = 0; j < childCount; j++) {
      comment.parentCommentId = comment._id;
      comment.comment = 'this is a child comment';
      comment.replyDepth = 1;
      commentCrud.create(comment);
    }

    logger.debug('exiting child create');
  })
}


