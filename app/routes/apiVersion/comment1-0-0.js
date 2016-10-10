var namespace = 'app.routes.apiVersion.comment1-0-0';

try {
    var log4js                  = require('log4js');
    var logger                  = log4js.getLogger(namespace);
    var commentCrud1_0_0        = require('../../persistence/crud/comment1-0-0');
    var notificationCrud1_0_0   = require('../../persistence/crud/notifications1-0-0');
    var socialCrud              = require('../../persistence/crud/socialMediaAccount');
    var videoCrud1_0_0          = require('../../persistence/crud/videos1-0-0');
    var Promise                 = require('bluebird');
    var mongoose                = require('mongoose');
    var moment                  = require('moment');
    var nodemailer              = require('nodemailer');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

/**
 *
 * @constructor
 */
function Comment() {}
/**
 * route: PROTECTED POST /api/comment
 * @param req
 * @param res
 */
function post(req, res) {
    var json = JSON.parse(req.body.data);
    var comment = json.comment;
    var notification = json.notification;
    commentCrud1_0_0
        .create(comment)
        .then(function (comment) {
            logger.debug(comment);
            var parentCommentId = comment.parentCommentId;
            var videoId = comment.videoId;
            notification.commentId = comment._id;
            notificationCrud1_0_0.create(notification)
                .then(function (notification) {
                });
            commentCrud1_0_0.replyIncrement(parentCommentId, videoId);
            res.send(comment);
        })
        .catch(function (error) {
        });
}
/**
 * route: none
 * @param req
 * @param res
 */
function get(req, res) {
    commentCrud1_0_0
        .get()
        .then(function (comments) {
            res.send(comments)
        })
}

/**
 * transform comments to change date with moment and update profilePicture
 * @param comments
 * @private
 */
function _transformComments(comments) {
    return Promise.map(comments, function (comment) {
        comment.commentDisplayDate = moment(comment.commentCreatedDate).fromNow();
        comment.showReplies = comment.replyCount > 0;
        if (comment.userId !== null) {
            return socialCrud.findByUserIdAndProvider(comment.userId._id, 'facebook')
                .then(function (social) {
                    socialCrud.setProfilePicture(social, comment.userId);
                    return comment;
                });
        } else {
            comment.userId = {};
            comment.userId.profilePicture = '/client/images/default.png';
            return comment;
        }
    });
}
/**
 * route: GET /api/comment/byParent
 * @param req
 * @param res
 */
function getByParentCommentId(req, res) {
    commentCrud1_0_0
        .getByParentCommentId(req.query.parentId)
        .then(_transformComments)
        .then(function (comments) {
            res.send(comments);
        });
}
/**
 * route: GET /api/comment/byVideo
 * @param req
 * @param res
 */
function getByVideoId(req, res) {
    commentCrud1_0_0
        .getParentCommentByVideoId({videoId: req.query.videoId, replyDepth: 0, page: req.query.page})
        .then(_transformComments)
        .then(function (comments) {
            res.json(comments);
        });
}
/**
 * route: GET /api/comment/:id
 * @param req
 * @param res
 */
function getById(req, res) {
    commentCrud1_0_0
        .getById(req.params.id)
        .then(function (comment) {
            res.send(comment);
        })
}
/**
 * route: PROTECTED PUT /api/comment/:id
 * @param req
 * @param res
 */
function put(req, res) {
    var notificationUpdate = {};
    notificationUpdate.notificationMessage = req.body.comment;
    notificationCrud1_0_0
        .getByComment(req.params.id)
        .then(function (notification) {
            if (notification.length) {
                return notificationCrud1_0_0.updateComment({id: notification[0]._id, update: notificationUpdate})
            } else {
                return;
            }
        })
        .then(function (notification) {
            logger.debug(notification);
            return commentCrud1_0_0.update({id: req.params.id, update: req.body})
        })
        .then(function (comment) {
            res.send(comment);
        });
}
/**
 * route: PROTECTED DELETE /api/comment/:id
 * @param req
 * @param res
 */
function deleteComment(req, res) {
    var reply;
    commentCrud1_0_0.getById(req.params.id)
        .then(function (comment) {
            if (!comment.parentCommentId) {
                return commentCrud1_0_0.getAllByParentComment(req.params.id)
            } else {
                reply = true;
                return comment;
            }
        })
        .then(function (comments) {
            if (typeof comments.length === 'undefined') {
                var removeObject = {};
                removeObject.removeCount = 1;
                removeObject.videoId = comments.videoId;
                return commentCrud1_0_0.replyDecrease(comments.parentCommentId)
                    .then(function () {
                        return notificationCrud1_0_0.deleteByCommentId(comments._id)
                    })
                    .then(function () {
                        return commentCrud1_0_0.remove(comments._id);
                    })
                    .then(function () {
                        return removeObject;
                    })
            } else {
                var removeObject = {};
                removeObject.removeCount = comments.length;
                removeObject.videoId = comments[0].videoId;
                return Promise.map(comments, function (comment) {
                    return notificationCrud1_0_0.deleteByCommentId(comment._id)
                        .then(function () {
                            return commentCrud1_0_0.remove(comment._id);
                        })
                }).then(function () {
                    return removeObject;
                })
            }
        })
        .then(function (removeObject) {
            videoCrud1_0_0.getById(removeObject.videoId)
                .then(function (video) {
                    var updateObject = {};
                    updateObject.id = video._id;
                    updateObject.update = {};
                    updateObject.update.commentCount = video.commentCount - removeObject.removeCount;
                    logger.error('this is the update object');
                    logger.debug(updateObject);
                    return videoCrud1_0_0.updateVideoFieldCounts(updateObject);
                })
        })
        .then(function () {
            if (!reply) {
                var commentId = req.params.id;
                return notificationCrud1_0_0.delete(commentId);
            } else {
                return;
            }
        })
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (error) {
            logger.error(error);
            res.sendStatus(500);
        })
}
/**
 *
 * @param req
 * @param res
 * @returns {*}
 */
function adminGetComments(req, res) {
    var videoId = req.query.videoId;
    return commentCrud1_0_0.getByVideoIdShowUser(videoId)
        .then(function (comments) {
            return Promise.map(comments, function (comment) {
                return commentCrud1_0_0.getByParentIdShowUser(comment._id)
                    .then(function (childComments) {
                        comment.childComments = childComments;
                        return comment;
                    })
            })
        })
        .then(function (comments) {
            res.send(comments);
        })
        .catch(function (error) {
            logger.error(error);
            res.sendStatus(500);
        })
}
/**
 * route: PROTECTED POST /api/comment/report
 * @param req
 * @param res
 */
function reportComment(req, res) {
    var commentId = req.body.commentId;
    commentCrud1_0_0
        .getById(commentId)
        .then(function (comment) {
            var transport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: 'support@airvuz.com',
                    pass: 'b5&YGG6n'
                }
            });

            var mailOptions = {
                from: 'noreply <noreply@airvuz.com>',
                to: 'support@airvuz.com',
                subject: 'Comment reported for video : ' + comment.videoId,
                html: '<p>A report has been submitted for comment Id : ' + comment._id + '.<br> Issue : Comment flagged for review <br> Comment Text :' + comment.comment + ' <br><a href="www.airvuz.com/video/' + comment.videoId + '"> Click here to go to video</a></p>'
            };

            transport.sendMail(mailOptions, function (error, message) {
                if (error) {
                    res.sendStatus(400);
                } else {
                    res.sendStatus(200);
                }
            })
        })
}

Comment.prototype.post = post;
Comment.prototype.get = get;
Comment.prototype.getByParentCommentId = getByParentCommentId;
Comment.prototype.getByVideoId = getByVideoId;
Comment.prototype.getById = getById;
Comment.prototype.put = put;
Comment.prototype.delete = deleteComment;
Comment.prototype.adminGetComments = adminGetComments;
Comment.prototype.reportComment = reportComment;

module.exports = new Comment();