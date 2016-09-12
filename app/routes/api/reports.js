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
                var userHasLike = [];
                    return Promise.map(comment.users, function(user) {
                        return Likes.findByUserIdAndVideoId(user.userId, comment.video)
                            .then(function(like) {
                                if(like) {
                                    user.like = like;
                                    userHasLike.push(user);
                                }
                            })
                    })
                    .then(function() {
                        comment.users = userHasLike;
                        if(comment.users.length > 0) {
                            logger.error(comment.users.length);
                            aggregateHasVideoLike.push(comment);
                        }
                    })
            });
        })
        .then(function() {
            return Promise.map(aggregateHasVideoLike, function (comment) {
                if (comment.users.length > 1) {
                    return Promise.map(comment.users, function (user) {
                        if(user.like) {
                            return Follow.findFollowByUserIdAndVideoOwnerId(user.userId, user.like.videoOwnerId._id)
                                .then(function (follow) {
                                    if (follow) {
                                        user.follow = follow;
                                    } else {
                                        var index = comment.users.indexOf(user.userId);
                                        comment.users.splice(index, 1);
                                    }
                                })
                        } else {
                            return;
                        }
                    })
                    .then(function() {
                        aggregateHasFollow.push(comment);
                    });
                } else {
                    return Promise.map(comment.users, function (user) {
                        if(user.like.videoOwnerId) {
                            return Follow.findFollowByUserIdAndVideoOwnerId(user.userId, user.like.videoOwnerId._id)
                                .then(function (follow) {
                                    if (follow) {
                                        user.follow = follow;
                                        aggregateHasFollow.push(comment);
                                    }
                                })
                        }
                    })
                }
            })
        })
        .then(function() {
            return Promise.map(aggregateHasFollow, function(video) {
                video.count = video.users.length;
            }).then(function() {
                aggregateHasFollow.sort(function(a,b) {
                    if(a.count < b.count) {
                        return 1;
                    }
                    if(a.count > b.count) {
                        return -1;
                    }
                    return 0;
                });
                res.send(aggregateHasFollow);
            })
        })
        .catch(function(error) {
            logger.error(error);
            res.sendStatus(500);
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
                                if(video){
                                    return Follow.findFollowByUserIdAndVideoOwnerId(user._id, video.userId)
                                        .then(function(follow) {
                                            comment.follow = !!follow;
                                            return user;
                                        });
                                }
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
                if(user) {
                    user.validComments = [];
                    return Promise.map(user.comment, function (comment) {
                        if (comment.follow === true && comment.liked === true) {
                            user.validComments.push(comment);
                        }
                        return user;
                    });
                }
            });
        })
        .then(function(users) {
            users = _.chain(users).flatten().uniq().value();
            var validUsers = [];
            Promise.map(users, function(user) {
                if(user) {
                    if(user.validComments.length > 0) {
                        validUsers.push(user);
                    }
                    user.count = user.validComments.length;
                }
            }).then(function() {
                validUsers.sort(function(a,b) {
                    if(a.count < b.count) {
                        return 1;
                    }
                    if(a.count > b.count) {
                        return -1;
                    }
                    return 0;
                });
                res.send(validUsers);
            });
        })
        .catch(function(error) {
            logger.error(error);
            res.sendStatus(500);
        })
};

Reports.prototype.siteInfo = function(req, res) {
  var endDate = req.query.endDate;
  var startDate = req.query.startDate;
  var promises = [
    User.totalUsersByEndDate(endDate),
    Videos.totalVideosByEndDate(endDate),
    User.newUsersBetweenDates(startDate, endDate),
    Videos.newVideosBetweenDates(startDate, endDate),
    User.newUserList(startDate, endDate)
  ];

  Promise.all(promises)
    .spread(function (totalUsers, totalVideos, newUsersCount, newVideos, newUsersList) {
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
    var startDate = new Date(req.body.startDate);
    var endDate = new Date(req.body.endDate);
    var limit = parseInt(req.body.limit, 10);
    return videoViews.top100AllTime(startDate, endDate, limit)
        .then(function(videos) {
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