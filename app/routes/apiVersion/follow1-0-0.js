var namespace = 'app.routes.apiVersion.follow1-0-0';
try {
    var log4js                  = require('log4js');
    var logger                  = log4js.getLogger(namespace);
    var followCrud1_0_0         = require('../../persistence/crud/follow1-0-0');
    var notificationCrud1_0_0   = require('../../persistence/crud/notifications1-0-0');
    var socialCrud              = require('../../persistence/crud/socialMediaAccount');
    var Promise                 = require('bluebird');
    var moment                  = require('moment');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch (exception) {
    logger.error(" import error:" + exception);
}

/**
 *
 * @constructor
 */
function Follow() {
}
/**
 *
 * @param req
 * @param res
 */
function getCheckFollowing(req, res) {
    var data = req.body;
    followCrud1_0_0
        .followCheck(data)
        .then(function (follow) {
            if (follow) {
                res.json({status: 'followed'});
            } else {
                res.json({status: 'unfollowed'});
            }
        })
        .error(function (error) {
            console.log(error);
            if (error.followId) {
                followCrud1_0_0.delete(error.followId)
                    .then(function (follow) {
                        res.json({status: 'unfollowed'});
                    })
            } else {
                res.send(500);
            }
        });
}
/**
 *
 * @param req
 * @param res
 */
function post(req, res) {
    var json = JSON.parse(req.body.data);
    var follow = json.follow;
    var notification = json.notification;
    followCrud1_0_0
        .create(follow)
        .then(function (follow) {
            notificationCrud1_0_0.create(notification)
                .then(function (notification) {
                    res.json({status: 'followed'});
                })
        })
        .catch(function (err) {
            if (err.followId) {
                followCrud1_0_0.delete(err.followId)
                    .then(function (follow) {
                        res.json({status: 'unfollowed'});
                    })
            } else {
                res.send(500);
            }
        });
}
/**
 *
 * @param req
 * @param res
 */
function getFollowers(req, res) {
    var userId = req.query.userId;
    var skip = (req.query.skip) * 10;
    var sendArray = [];
    followCrud1_0_0
        .getFollowers(userId, skip)
        .then(function (followers) {
            Promise.map(followers, function (follower) {
                console.log(follower.createdDate);
                follower.createdDate = moment(follower.createdDate).format('MM-DD-YYYY');
                if (follower.userId) {
                    return socialCrud.findByUserIdAndProvider(follower.userId._id, 'facebook')
                        .then(function (social) {
                            socialCrud.setProfilePicture(social, follower.userId);
                            return follower;
                        })
                        .then(function (follower) {
                            sendArray.push(follower);
                        });
                }
            })
                .then(function () {
                    sendArray.sort(function (a, b) {
                        if (a.createdDate < b.createdDate) {
                            return 1;
                        }
                        if (a.createdDate > b.createdDate) {
                            return -1;
                        }
                        return 0;
                    });
                })
                .then(function () {
                    res.send(sendArray);
                })
        })
        .catch(function (error) {
            res.sendStatus(500);
        })
}
/**
 *
 * @param req
 * @param res
 */
function getFollowing(req, res) {
    var userId = req.query.userId;
    var skip = (req.query.skip) * 10;
    var sendArray = [];
    followCrud1_0_0
        .getFollowing(userId, skip)
        .then(function (followers) {
            Promise.map(followers, function (follower) {
                console.log(follower.createdDate);
                follower.createdDate = moment(follower.createdDate).format('MM-DD-YYYY');
                if (follower.followingUserId) {
                    return socialCrud.findByUserIdAndProvider(follower.followingUserId._id, 'facebook')
                        .then(function (social) {
                            socialCrud.setProfilePicture(social, follower.followingUserId);
                            return follower;
                        })
                        .then(function (follower) {
                            console.log('post promise');
                            console.log(follower.createdDate);
                            sendArray.push(follower);
                        })
                }
            })
                .then(function () {
                    sendArray.sort(function (a, b) {
                        if (a.createdDate < b.createdDate) {
                            return 1;
                        }
                        if (a.createdDate > b.createdDate) {
                            return -1;
                        }
                        return 0;
                    });
                })
                .then(function () {
                    res.send(sendArray);
                })
        })
        .catch(function (error) {
            res.sendStatus(500);
        })
}

Follow.prototype.getCheckFollowing = getCheckFollowing;
Follow.prototype.post = post;
Follow.prototype.getFollowers = getFollowers;
Follow.prototype.getFollowing = getFollowing;

module.exports = new Follow();