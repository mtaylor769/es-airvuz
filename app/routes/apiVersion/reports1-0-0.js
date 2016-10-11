var namespace = 'app.routes.apiVersion.reports1-0-0';
try {
    var log4js                  = require('log4js');
    var logger                  = log4js.getLogger(namespace);
    var Promise                 = require('bluebird');
    var _                       = require('lodash');
    var userCrud1_0_0           = require('../../persistence/crud/users1-0-0');
    var videoCrud1_0_0          = require('../../persistence/crud/videos1-0-0');
    var commentCrud1_0_0        = require('../../persistence/crud/comment1-0-0');
    var videoLikeCrud1_0_0      = require('../../persistence/crud/videoLike1-0-0');
    var followCrud1_0_0         = require('../../persistence/crud/follow1-0-0');
    var videoViews              = require('../../persistence/crud/videoViews');
    var catTypeCrud1_0_0        = require('../../persistence/crud/categoryType1-0-0');
    var eventTrackerCrud        = require('../../persistence/crud/events/eventTracking');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}


function Reports() {

}
/**
 * route: GET /api/reports/videos
 * @param req
 * @param res
 */
function getVideos(req, res) {
  var username = req.query.username;
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;
  
  userCrud1_0_0.getByUserName(username)
    .then(function(user) {
      logger.debug(user);
      return videoCrud1_0_0.getByUserAndDate(user._id, startDate, endDate)
    })
    .then(function(videos) {
      res.send(videos)
    })
  
}
/**
 * route: GET /api/reports/comments
 * @param req
 * @param res
 */
function getComments(req, res) {
  var username = req.query.username;
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;

  userCrud1_0_0.getByUserName(username)
    .then(function(user) {
      return commentCrud1_0_0.getByUserAndDate(userCrud1_0_0._id, startDate, endDate)
    })
    .then(function(comments) {
      res.json({commentCount: comments});
    })
}
/**
 * route: POST /api/reports/employee-contributor
 * @param req
 * @param res
 * @returns {*}
 */
function employeeContributor(req, res) {
var usersArray = [];
  var startDate = new Date(req.body.startDate);
  var endDate = new Date(req.body.endDate);
  return userCrud1_0_0.getEmployeeContributor()
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
}
/**
 * route: POST /api/reports/hashtag
 * @param req
 * @param res
 * @returns {*}
 */
function hashTag(req, res) {
    var hashTag = new RegExp(req.body.hashTag, 'i');
    var startDate = new Date(req.body.startDate);
    var endDate = new Date(req.body.endDate);
    var aggregateHasVideoLike = [];
    var aggregateHasFollow = [];
    return commentCrud1_0_0.findByHashAndDate(hashTag, startDate, endDate)
        .then(function(commentAggregate) {
            return Promise.map(commentAggregate, function(comment) {
                var userHasLike = [];
                    return Promise.map(comment.users, function(user) {
                        return videoLikeCrud1_0_0.findByUserIdAndVideoId(user.userId, comment.video)
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
                            return followCrud1_0_0.findFollowByUserIdAndVideoOwnerId(user.userId, user.like.videoOwnerId._id)
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
                            return followCrud1_0_0.findFollowByUserIdAndVideoOwnerId(user.userId, user.like.videoOwnerId._id)
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
}
/**
 * route: POST /api/reports/user-hashtag
 * @param req
 * @param res
 * @returns {*}
 */
function userHashtag(req, res) {
    var hashtag = new RegExp(req.body.hashtag, 'i');
    var startDate = new Date(req.body.startDate);
    var endDate = new Date(req.body.endDate);

    return commentCrud1_0_0.findUserByHashAndDate(hashtag, startDate, endDate)
        .then(function(users) {
            return Promise.map(users, function(user) {
                user.comment = _.uniqBy(user.comment, function(comment){
                  return JSON.stringify(comment.videoId);
                });
                return Promise.map(user.comment, function(comment) {
                    return videoLikeCrud1_0_0.findByUserIdAndVideoId(user._id, comment.videoId)
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
                        return videoCrud1_0_0.getById(comment.videoId)
                            .then(function(video) {
                                if(video){
                                    return followCrud1_0_0.findFollowByUserIdAndVideoOwnerId(user._id, video.userId)
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
}
/**
 * route: GET /api/reports/site-info
 * @param req
 * @param res
 */
function siteInfo(req, res) {
  var endDate = new Date(req.query.endDate);
  var startDate = new Date(req.query.startDate);
  var promises = [
    userCrud1_0_0.totalUsersByEndDate(endDate),
    videoCrud1_0_0.totalVideosByEndDate(endDate),
    userCrud1_0_0.newUsersBetweenDates(startDate, endDate),
    videoCrud1_0_0.newVideosBetweenDates(startDate, endDate),
    userCrud1_0_0.newUserList(startDate, endDate)
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
}
/**
 *
 * @param video
 * @param eventObj
 * @returns {*}
 * @private
 */
function _getVideoPercent(video, eventObj) {
    video.percentageInfo = {};
    video.percentageInfo.videoStarted = eventObj.videoStart;
    video.percentageInfo.videoEnded = eventObj.videoEnded;
    video.percentageInfo.percentageFullWatch = (eventObj.videoEnded / eventObj.videoStart);
    video.percentageInfo.percentageWatchedOnExit = (eventObj.videoExit.timeWatched / eventObj.videoExit.totalTime);
    video.percentageInfo.totalViewPercentage = eventObj.viewPercentage.percentage;
    return video;
}
/**
 *
 * @param req
 * @param res
 * @returns {*}
 */
function top100Views(req, res) {
    var startDate = new Date(req.body.startDate);
    var endDate = new Date(req.body.endDate);
    var limit = parseInt(req.body.limit, 10);
    return videoViews.top100AllTime(startDate, endDate, limit)
        .then(function(videos) {
            return Promise.map(videos, function(video) {
                return eventTrackerCrud.getByVideoId(video._id, startDate, endDate)
                    .then(function (eventObj) {
                        return _getVideoPercent(video, eventObj);
                    });
            })
        })
        .then(function(videos) {
           res.json(videos);
        })
        .catch(function(error) {
          logger.error(error);
            res.sendStatus(500);
        });

}
/**
 * route: GET /api/reports/video-percentage
 * @param req
 * @param res
 * @returns {*}
 */
function videoPercentage(req, res) {
    var videoId = req.query.videoId;
    var startDate = new Date(req.query.startDate);
    var endDate = new Date(req.query.endDate);

    return videoCrud1_0_0.getByIdAndPopulateUser(videoId)
        .then(function(video) {
            return eventTrackerCrud.getByVideoId(videoId, startDate, endDate)
                .then(function (eventObj) {
                    return _getVideoPercent(video, eventObj);
                });
        })
        .then(function (video) {
            res.json(video);
        })
        .catch(function(error) {
            res.send(error);
        });
}

Reports.prototype.getVideos             = getVideos;
Reports.prototype.getComments           = getComments;
Reports.prototype.employeeContributor   = employeeContributor;
Reports.prototype.hashTag               = hashTag;
Reports.prototype.userHashtag           = userHashtag;
Reports.prototype.siteInfo              = siteInfo;
Reports.prototype.top100Views           = top100Views;
Reports.prototype.videoPercentage       = videoPercentage;

module.exports = new Reports();