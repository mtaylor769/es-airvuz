var mongoose = require('mongoose');

var videoCollectionSchema = mongoose.Schema({
  name: {
    required: true,
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }]
});

module.exports = {
  connectionName: 'main',
  modelName: 'VideoCollection',
  schema: videoCollectionSchema
};