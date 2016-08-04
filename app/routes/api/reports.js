var log4js					= require('log4js');
var logger					= log4js.getLogger('app.routes.api.videoLike');
var Promise                 = require('bluebird');
var User            = require('../../persistence/crud/users');
var Videos           = require('../../persistence/crud/videos');
var Comment         = require('../../persistence/crud/comment');
var Likes           = require('../../persistence/crud/videoLike');
var Follow         = require('../../persistence/crud/follow');

function Reports() {
  
}

Reports.prototype.getVideos = function(req, res) {
  var username = req.query.username;
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;
  
  User.getByUserName(username)
    .then(function(user) {
      logger.debug(user);
      return Videos.getByUserAndDate(user._id, startDate, endDate)
    })
    .then(function(videos) {
      res.send(videos)
    })
  
};

Reports.prototype.getComments = function(req, res) {
  var username = req.query.username;
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;

  User.getByUserName(username)
    .then(function(user) {
      return Comment.getByUserAndDate(user._id, startDate, endDate)
    })
    .then(function(comments) {
      res.json({commentCount: comments});
    })
};

Reports.prototype.employeeContributor = function(req, res) {
  var usersArray = [];
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  return User.getEmployeeContributor()
      .then(function(users) {
        return Promise.map(users, function (user) {
          var userInfo = {};
          userInfo.user = user;
          return Likes.findByUserIdAndDate(user._id, startDate, endDate)
              .then(function(likes) {
                userInfo.likes = likes;
                return Comment.getByUserAndDate(user._id, startDate, endDate)
              })
              .then(function(comments) {
                userInfo.comments = comments;
                return Follow.findFollowersByUserIdAndDate(user._id, startDate, endDate)
              })
              .then(function(followers) {
                userInfo.followers = followers;
                return Follow.findFollowingByUserIdAndDate(user._id, startDate, endDate)
              })
              .then(function(following) {
                userInfo.following = following;
                return Videos.findByUserIdAndDate(user._id, startDate, endDate)
              })
              .then(function(videos) {
                userInfo.uploadedVideos = videos;
                return userInfo;
              })
              .then(function(userInfo) {
                usersArray.push(userInfo);
              })
        })
        .then(function() {
          res.send(usersArray);
        })
      })
};

Reports.prototype.hashTag = function(req, res) {
    console.log(req.body);
    var hashTag = new RegExp(req.body.hashTag, 'i');
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var videosWithHashtags = [];
    console.log(hashTag);
     Videos
        .getAllVideos()
        .then(function(videos) {
            console.log(videos.length);
            return Promise.map(videos, function(video) {
                return Comment
                    .findByVideoAndHashAndDate(video._id, hashTag, startDate, endDate)
                    .then(function (comments){
                        if(comments) {
                            console.log(comments);
                            video.hashCount = comments;
                            videosWithHashtags.push(video);
                        }
                    })
            })
            .then(function() {
                logger.error('console.log for videosWithHash length');
                logger.debug(videosWithHashtags.length);
                res.send(videosWithHashtags);
            })
        })

};

Reports.prototype.siteInfo = function(req, res) {
  logger.debug('REPORTS: IN');
  var endDate = req.query.endDate;
  var startDate = req.query.startDate;
  var totalUsers;
  var totalVideos;
  var newVideos;
  var newUsersCount;
  var newUsersList;
  var promises = [];


  promises.push(User.totalUsersByEndDate(endDate)
    .then(function(users) {
      totalUsers = users;
    })
  );

  promises.push(Videos.totalVideosByEndDate(endDate)
    .then(function(videos) {
      totalVideos = videos;
    })
  );

  promises.push(User.newUsersBetweenDates(startDate, endDate)
    .then(function(users) {
      newUsersCount = users;
    })
  );

  promises.push(Videos.newVideosBetweenDates(startDate, endDate)
    .then(function(videos) {
      newVideos = videos;
    })
  );

  promises.push(User.newUserList(startDate, endDate)
    .then(function(users) {
      newUsersList = users;
    })
  );

  Promise.all(promises)
    .then(function () {
      res.json({
        title: 'Site Info',
        totalUsers: totalUsers,
        totalVideos: totalVideos,
        newUsersCount: newUsersCount,
        newVideos: newVideos,
        newUsersList: newUsersList});
    });
};


module.exports = new Reports();