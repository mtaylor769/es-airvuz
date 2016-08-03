var mongoose = require('mongoose');
var Promise = require('bluebird');
var Notification = null;
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

Notification = mongoose.model('Notification', require('../app/persistence/model/notifications.js').schema);
Comment = mongoose.model('Comment', require('../app/persistence/model/comment.js').schema);
Video = mongoose.model('Video', require('../app/persistence/model/videos.js').schema);

function closeDatabaseConnection() {
    mongoose.connection.close();
    console.log('******************** close database connection ********************');
}

function getVideos() {
    return Video.find({}).exec()
}

function getVideoComments(videos) {
    return Promise.map(videos, function(video) {
        return Comment.find({videoId: video._id}).lean().exec()
            .then(function(comments) {
                return Promise.map(comments, function(comment) {
                    if(comment.parentCommentId !== null) {
                        return Comment.findById(comment.parentCommentId)
                            .then(function(parentComment) {
                                return Notification.find({videoId: parentComment.videoId, notifiedUserId: parentComment.userId}).lean().exec()
                                    .then(function(notifications) {
                                        return Promise.map(notifications, function(notification) {
                                            if(notification.notificationMessage === comment.comment) {
                                                return Notification.findByIdAndUpdate(notification._id, {commentId: comment._id}).exec()
                                            } else {
                                                return;
                                            }
                                        })
                                    })
                            })
                    } else {
                        return Notification.find({videoId: comment.videoId, notifiedUserId: video.userId}).lean().exec()
                            .then(function(notifications) {
                                return Promise.map(notifications, function(notification) {
                                    if(notification.notificationMessage === comment.comment) {
                                        return Notification.findByIdAndUpdate(notification._id, {commentId: comment._id}).exec()
                                    } else {
                                        return;
                                    }
                                })
                            })
                    }
                })
            })
    })
}

mongoose.connection.once('connected', function() {
    getVideos()
        .then(getVideoComments)
        .catch(function(error) {
            console.log(error);
        })
        .finally(closeDatabaseConnection);
});