var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;

var schema        = mongoose.Schema({
  name            : String,
  imageUrl        : String,
  imageAlt        : String,
  videoUrl        : String,
  description     : String
});

module.exports = {
  connectionName  : 'main',
  modelName       : 'Slide',
  schema          : schema
};

