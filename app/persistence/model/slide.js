var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;

var schema        = mongoose.Schema({
  imageUrl        : String,
  videoUrl        : String,
  description     : String,
  seo             : String
});

module.exports = {
  connectionName  : 'main',
  modelName       : 'Slide',
  schema          : schema
};

