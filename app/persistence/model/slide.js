var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;

var schema        = mongoose.Schema({
  name            : String,
  imagePath       : String,
  imageAlt        : String,
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  },
  description     : String
});

module.exports = {
  connectionName  : 'main',
  modelName       : 'Slide',
  schema          : schema
};

