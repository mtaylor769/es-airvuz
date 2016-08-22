var log4js					= require('log4js');
var logger					= log4js.getLogger('app.routes.api.videoLike');
var Promise         = require('bluebird');
var _               = require('lodash');
var User            = require('../../persistence/crud/users');
var Videos          = require('../../persistence/crud/videos');
var Comment         = require('../../persistence/crud/comment');
var Likes           = require('../../persistence/crud/videoLike');
var Follow         = require('../../persistence/crud/follow');
var videoViews    = require('../../persistence/crud/videoViews');
var categories = require('../../persistence/crud/categoryType');

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
    var hashTag = new RegExp(req.body.hashTag, 'i');
    var startDate = new Date(req.body.startDate);
    var endDate = new Date(req.body.endDate);
    var aggregateHasVideoLike = [];
    var aggregateHasFollow = [];
    return Comment.findByHashAndDate(hashTag, startDate, endDate)
        .then(function(commentAggregate) {
            return Promise.map(commentAggregate, function(comment) {
                if(comment.users.length > 1){
                    return Promise.map(comment.users, function(user) {
                        return Likes.findByUserIdAndVideoId(user.userId, comment.video)
                            .then(function(like) {
                                if(like) {
                                    user.like = like;
                                } else {

                                }
                            })
                    })
                    .then(function() {
                        aggregateHasVideoLike.push(comment);
                    })
                } else {
                    return Promise.map(comment.users, function(user) {
                        return Likes.findByUserIdAndVideoId(user.userId, comment.video)
                            .then(function(like) {
                                if(like) {
                                    user.like = like;
                                    aggregateHasVideoLike.push(comment);
                                }
                            })
                    })
                }
            });
        })
        .then(function() {
            return Promise.map(aggregateHasVideoLike, function (comment) {
                if (comment.users.length > 1) {
                    return Promise.map(comment.users, function (user) {
                        return Follow.findFollowByUserIdAndVideoOwnerId(user.userId, user.like.videoOwnerId)
                            .then(function (follow) {
                                if (follow) {
                                    user.follow = follow;
                                } else {
                                    var index = comment.users.indexOf(user.userId);
                                    comment.users.splice(index, 1);
                                }
                            })
                    })
                    .then(function() {
                        aggregateHasFollow.push(comment);
                    });
                } else {
                    return Promise.map(comment.users, function (user) {
                        return Follow.findFollowByUserIdAndVideoOwnerId(user.userId, user.like.videoOwnerId)
                            .then(function (follow) {
                                if (follow) {
                                    user.follow = follow;
                                    aggregateHasFollow.push(comment);
                                }
                            })
                    })
                }
            })
        })
        .then(function() {
            return Promise.map(aggregateHasFollow, function(video) {
                video.count = video.users.length;
            }).then(function() {
                res.send(aggregateHasFollow);
            })
        })
};

Reports.prototype.userHashtag = function(req, res) {
    var hashtag = new RegExp(req.body.hashtag, 'i');
    var startDate = new Date(req.body.startDate);
    var endDate = new Date(req.body.endDate);

    return Comment.findUserByHashAndDate(hashtag, startDate, endDate)
        .then(function(users) {
            return Promise.map(users, function(user) {
                user.comment = _.uniqBy(user.comment, function(comment){
                  return JSON.stringify(comment.videoId);
                });
                return Promise.map(user.comment, function(comment) {
                    return Likes.findByUserIdAndVideoId(user._id, comment.videoId)
                        .then(function(like) {
                            comment.liked = !!like;
                            return user;
                        });
                });
            });
        })
        .then(function(users) {
            users = _.chain(users).flatten().uniq().value();
            return Promise.map(users, function(user) {
                return Promise.map(user.comment, function(comment) {
                    if(comment.liked) {
                        return Videos.getById(comment.videoId)
                            .then(function(video) {
                                return Follow.findFollowByUserIdAndVideoOwnerId(user._id, video.userId)
                                    .then(function(follow) {
                                        comment.follow = !!follow;
                                        return user;
                                    });
                            });
                    } else {
                        return user;
                    }
                });
            });
        })
        .then(function(users) {
            users = _.chain(users).flatten().uniq().value();
            return Promise.map(users, function(user) {
                user.validComments = [];
                return Promise.map(user.comment, function(comment) {
                    if(comment.follow === true && comment.liked === true) {
                        user.validComments.push(comment);
                    }
                    return user;
                });
            });
        })
        .then(function(users) {
            users = _.chain(users).flatten().uniq().value();
            var validUsers = [];
            Promise.map(users, function(user) {
                if(user.validComments.length > 0) {
                    validUsers.push(user);
                }
                user.count = user.validComments.length;
            }).then(function() {
                res.send(validUsers);
            });
        });
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

Reports.prototype.top100Views = function(req, res) {
    console.log(req.body);
    var startDate = new Date(req.body.startDate);
    var endDate = new Date(req.body.endDate);
    var limit = parseInt(req.body.limit, 10);
    return videoViews.top100AllTime(startDate, endDate, limit)
        .then(function(videos) {
            console.log(videos)
            return Promise.map(videos, function(video) {
                return Promise.map(video.videoObject.categories, function(category) {
                    return categories.getById(category)
                }).then(function(categories) {
                    video.videoObject.categories = categories;
                    return video;
                })
            })
        })
        .then(function(videos) {
           res.send(videos)
        })

};


module.exports = new Reports();