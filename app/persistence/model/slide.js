var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;

var schema        = mongoose.Schema({
  name            : String,
  imagePath       : String,
  imageAlt        : String,
  videoId         : String,
  description     : String
});

module.exports = {
  connectionName  : 'main',
  modelName       : 'Slide',
  schema          : schema
};

