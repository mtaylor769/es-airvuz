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
	var commentCrud   = require('../../persistence/crud/comment');
	var videoLikeCrud = require('../../persistence/crud/videoLike');
	var categoryCrud  = require('../../persistence/crud/categoryType');
	var followCrud		= require('../../persistence/crud/follow');
	var config				= require('../../../config/config')[process.env.NODE_ENV || 'development'];
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
			console.log(video);
			if(video.title.length > 45) {
				video.title = video.title.substring(0, 45) + '...';
			}
			dataObject.video 	= video;
			checkObject.video = video._id;
			return userCrud.getUserById(video.userId);
		})
		.then(function(user) {
			dataObject.user 	= user;
			checkObject.user  = user._id;

			// TODO: need to refactor for algorithm
			return videoCrud.get5Videos();
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
			return videoCrud.getTopTwoVideos(checkObject.user);
			})
		.then(function(topThreeVideos) {
			var topVideos = [];
			topThreeVideos.forEach(function(video) {
				if(video._id.toString() !== videoId && topVideos.length < 2) {
					topVideos.push(video);
				}
			});
			
			dataObject.topTwoVideos = topVideos;
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
			comments.forEach(function(comment) {
				comment.commentDisplayDate = moment(comment.commentCreatedDate).fromNow();
				console.log(comment.commentCreatedDate);
			});
			dataObject.comments = comments;
				return categoryCrud.get();
		})
		.then(function(categories) {
			console.log('completed all checks');
			dataObject.categories = categories;
			params.data													= dataObject;
			params.data.facebookAppId 					= config.facebook.clientID;
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