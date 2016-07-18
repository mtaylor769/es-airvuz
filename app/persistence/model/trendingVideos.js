var mongoose = require('mongoose');

var schema = mongoose.Schema({
  _id:  {
    ref				: 'Video',
    type			: mongoose.Schema.ObjectId
  },
  user: {
    ref				: 'Users',
    type			: mongoose.Schema.ObjectId
  },
  count: Number
});

module.exports = {
  connectionName	: "main",
  modelName				: "TrendingVideos",
  schema					: schema
};