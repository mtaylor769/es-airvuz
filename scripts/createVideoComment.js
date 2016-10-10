var comment = require('../test/mockObjects/comment');
var commentCrud = require('../app/persistence/crud/comment1-0-0');
var mongoose = require('../mongoose');
var id = '56f1807e64c3ebbd0fb261dc';

commentCrud.create(comment);