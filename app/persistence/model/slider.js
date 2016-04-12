var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;

var schema        = mongoose.Schema({
  startDate       : Date,
  endDate         : Date,
  isActive        : Boolean,
  slide           : [{type: mongoose.Schema.ObjectId, ref: 'Slide'}] // order matter
});

module.exports = {
  connectionName  : 'main',
  modelName       : 'Slider',
  schema          : schema
};

