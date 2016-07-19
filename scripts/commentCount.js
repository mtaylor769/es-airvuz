var mongoose = require('mongoose');
var Promise = require('bluebird');
var Video = null;
var Comment = null;

var DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
var databaseOptions = {
  user: process.env.DATABASE_USER || '',
  pass: process.env.DATABASE_PASSWORD || '',
  auth: {
    authdb: 'admin'
  }
};

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://' + DATABASE_HOST + '/AirVuz2', databaseOptions);

Video = mongoose.model('Video', require('../app/persistence/model/videos.js').schema);
Comment = mongoose.model('Comment', require('../app/persistence/model/comment.js').schema);

function closeDatabaseConnection() {
  mongoose.connection.close();
  console.log('******************** close database connection ********************');
}

function getVideos() {
  return Video.find({}).exec();
}

function getCommentCount(videoId) {
  return Comment.find({videoId: videoId})
    .count()
    .exec()
}

function resetVideoCommentCount(videos) {
  return Promise.map(videos, function(video) {
    return getCommentCount(video._id)
      .then(function(commentCount) {
        console.log(video._id);
        console.log(commentCount);
        return Video.findByIdAndUpdate(video._id, {commentCount: commentCount}).exec()
      });
  })
}

mongoose.connection.once('connected', function() {
  getVideos()
    .then(resetVideoCommentCount)
    .catch(function(error) {
      console.log(error);
    })
    .finally(closeDatabaseConnection);
});
