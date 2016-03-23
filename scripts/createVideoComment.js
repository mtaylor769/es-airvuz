var comment = {
  comment: 'this is a test comment',
  commentCreatedDate: Date.now(),
  isVisible: true,
  userId: '56f1807e64c3ebbd0fb261dc'
};
var videoCommentCrud = require('../app/persistence/crud/videoComment');
var mongoose = require('../mongoose');
var id = '56f1807e64c3ebbd0fb261dc';

videoCommentCrud.create(comment);