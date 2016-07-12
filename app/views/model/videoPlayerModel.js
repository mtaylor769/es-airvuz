// IMPORT: BEGIN
var namespace				= 'app.views.model.videoPlayerModel';
var log4js					= require('log4js');
var logger					= log4js.getLogger(namespace);


try {
	var BaseModel	    = require('./baseModel');
	var EventTrackingCrud			= require('../../persistence/crud/events/eventTracking');
	var Promise		    = require('bluebird');
	var moment				= require('moment');
	var util			    = require('util');
	var videoCrud     = require('../../persistence/crud/videos');
	var userCrud      = require('../../persistence/crud/users');
	var socialCrud		= require('../../persistence/crud/socialMediaAccount');
	var commentCrud   = require('../../persistence/crud/comment');
	var videoLikeCrud = require('../../persistence/crud/videoLike');
	var categoryCrud  = require('../../persistence/crud/categoryType');
	var followCrud		= require('../../persistence/crud/follow');
	var amazonConfig  = require('../../config/amazon.config');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");	
	}

	logger.info("import complete");	
}
catch(exception) {
	logger.error(" import error:" + exception);
}
// IMPORT: END

var VideoPlayerModel = function(params) {
	logger.debug("constructor: IN");	
	
	BaseModel.apply(this, arguments);
};

util.inherits(VideoPlayerModel, BaseModel);

VideoPlayerModel.prototype.getData = function(params) {
	EventTrackingCrud.create({
		codeSource	: namespace,
		eventSource : "nodejs",
		eventType		: "getData"		
	});	
	
	var videoId         = params.request.params.id;
	var dataObject      = {};
	var sourceManifest	= params.sourceManifest;
	var checkObject 		= {};

	// TODO: run parallel
	return videoCrud.getById(videoId)
		.then(function(video) {
			logger.debug(video);
			if(video.title.length > 45) {
				video.title = video.title.substring(0, 45) + '...';
			}
			video.displayDate = moment(video.uploadDate).fromNow();
			video.openGraphCacheDate = moment(video.openGraphCacheDate).format('x');
			logger.debug(video.openGraphCacheDate);
			logger.debug(video.uploadDate);
			dataObject.video 	= video;
			checkObject.video = video._id;
			return userCrud.getUserById(video.userId);
		})
		.then(function(user){
			if (user !== null) {
				socialCrud.findByUserIdAndProvider(user._id, 'facebook')
					.then(function (social) {
						if (social && user.profilePicture === '') {
							user.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
						} else if (!social && user.profilePicture === '') {
							user.profilePicture = '/client/images/default.png';
						} else if (social && user.profilePicture.indexOf('facebook') > -1) {
							user.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
						} else if (user.profilePicture.indexOf('http') === -1) {
							user.profilePicture = '/api/image/profile-picture' + user.profilePicture + '?size=50';
						}
					})
			} else {
				user.profilePicture = '/client/images/default.png';
			}
			if(user.userNameDisplay.length > 12) {
			user.userNameDisplay = user.userNameDisplay.substring(0, 12) + '...';
			}
			dataObject.user 	= user;
			checkObject.user  = user._id;
			
			dataObject.user.isExternalLink = user.profilePicture.indexOf('http') > -1;

			return videoCrud.getNextVideos(dataObject.video.categories[0]);
		})
		.then(function(videos) {
			videos.forEach(function (video) {
				video.fullTitle = video.title;
				video.displayDate = moment(video.uploadDate).fromNow();
				video.title = video.title.substring(0, 30);
				video.description = video.description.substring(0, 90);
				if (video.title.length === 30) {
					video.title = video.title + '...'
				}
				if (video.description.length === 90) {
					video.description = video.description + '...';
				}
			});
			dataObject.upNext = videos;
			return videoCrud.getVideoCount(checkObject.user);
		})
		.then(function(videoCount) {
			dataObject.videoCount = videoCount;
			return videoCrud.getTopSixVideos(checkObject.user);
			})
		.then(function(topSixVideos) {
			var topVideos = [];
			topSixVideos.forEach(function(video) {
				if(video._id.toString() !== videoId) {
					topVideos.push(video);
				}
			});
			
			dataObject.topVideos = topVideos;
			return followCrud.followCount(checkObject.user);
		})
		.then(function(followCount) {
			dataObject.followCount = followCount;

			return videoLikeCrud.videoLikeCheck(checkObject);
		})
		.then(function(likeBoolean) {
			dataObject.likeBoolean = likeBoolean;
			return commentCrud.getParentCommentByVideoId({videoId: videoId});
		})
		.then(function (comments) {
			return Promise.map(comments, function (comment) {
				console.log(comment);
				comment.commentDisplayDate = moment(comment.commentCreatedDate).fromNow();
				if (comment.userId !== null) {
					return socialCrud.findByUserIdAndProvider(comment.userId._id, 'facebook')
						.then(function (social) {
							logger.debug(social);
							if (social && comment.userId.profilePicture === '') {
								comment.userId.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
								return comment;
							} else if (!social && comment.userId.profilePicture === '') {
								comment.userId.profilePicture = '/client/images/default.png';
								return comment;
							} else if (social && comment.userId.profilePicture.indexOf('facebook') > -1) {
								comment.userId.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=small';
								return comment;
							} else if (comment.userId.profilePicture.indexOf('http') === -1 && comment.userId.profilePicture.indexOf('image/profile-picture') === -1) {
								comment.userId.profilePicture = '/api/image/profile-picture' + comment.userId.profilePicture + '?size=50';
								return comment;
							} else {
								return comment;
							}
						})
				} else {
					comment.userId = {};
					comment.userId.profilePicture = '/client/images/default.png';
					return comment;
				}
			});
		})
		.then(function (comments) {
			logger.error(comments);
			dataObject.comments = comments;
			dataObject.hasMoreComments = dataObject.video.commentCount > comments.length;
			return categoryCrud.get();
		})
		.then(function(categories) {
			logger.debug('completed all checks');
			logger.debug(dataObject.topTwoVideos);
			
			dataObject.categories = categories;
			params.data													= dataObject;
			params.data.videoPlayer							= {};
			params.data.videoPlayer.title				= "Video Player";
			params.data.videoPlayer.viewName		= "Video Player";

			params.data.airvuz 									= {};
			params.data.vendor 									= {};
			params.data.airvuz.js 							= sourceManifest["airvuz.js"];
			params.data.airvuz.css 							= sourceManifest["airvuz.css"];
			params.data.vendor.js 							= sourceManifest["vendor.js"];

			params.data.s3Bucket 								= amazonConfig.OUTPUT_URL;
			params.data.s3AssetUrl 							= amazonConfig.ASSET_URL;
			return params;
	});

};

module.exports = VideoPlayerModel;