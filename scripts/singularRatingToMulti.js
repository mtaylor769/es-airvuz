var mongoose = require('mongoose');
var Promise = require('bluebird');
var Video = null;

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

function closeDatabaseConnection() {
  mongoose.connection.close();
  console.log('******************** close database connection ********************');
}

function getVideos() {
  return Video.find({}).exec();
}

function resetRating(videos) {
  return Promise.map(videos, function(video) {
    if(video.internalRanking) {
      return video.save();
    }
    return video;
  })
}

mongoose.connection.once('connected', function() {
  getVideos()
    .then(resetRating)
    .catch(function(error) {
      console.log(error);
    })
    .finally(closeDatabaseConnection);
});