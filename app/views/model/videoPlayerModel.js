// IMPORT: BEGIN
var namespace				= 'app.views.model.videoPlayerModel';
var log4js					= require('log4js');
var logger					= log4js.getLogger(namespace);


try {
	var BaseModel	    	= require('./baseModel');
	var Promise		    	= require('bluebird');
	var moment				= require('moment');
	var util			    = require('util');
	var videoCrud1_0_0     		= require('../../persistence/crud/videos1-0-0');
	var usersCrud1_0_0      = require('../../persistence/crud/users1-0-0');
	var socialCrud			= require('../../persistence/crud/socialMediaAccount');
	var commentCrud   		= require('../../persistence/crud/comment');
	var videoLikeCrud 		= require('../../persistence/crud/videoLike');
	var categoryCrud  		= require('../../persistence/crud/categoryType');
	var followCrud			= require('../../persistence/crud/follow');
	var amazonConfig  		= require('../../config/amazon.config');
	var config				= require('../../../config/config')[global.NODE_ENV];

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
	var videoId         = params.request.params.id;
	var dataObject      = {};
	var checkObject 		= {};

	// TODO: run parallel
	return videoCrud1_0_0.getById(videoId)
		.then(function(video) {
			if(video.title.length > 45) {
				video.title = video.title.substring(0, 45) + '...';
			}
			video.displayDate = moment(video.uploadDate).fromNow();
			video.openGraphCacheDate = moment(video.openGraphCacheDate).format('x');
			dataObject.video 	= video;
			checkObject.video = video._id;
			return usersCrud1_0_0.getUserById(video.userId);
		})
		.then(function(user){
			if (user !== null) {
				socialCrud.findByUserIdAndProvider(user._id, 'facebook')
					.then(function (social) {
						socialCrud.setProfilePicture(social, user);
					});
			} else {
				user.profilePicture = '/client/images/default.png';
			}
			if(user.userNameDisplay.length > 12) {
			user.userNameDisplay = user.userNameDisplay.substring(0, 12) + '...';
			}
			dataObject.user 	= user;
			checkObject.user  = user._id;
			
			dataObject.user.isExternalLink = user.profilePicture.indexOf('http') > -1;

			return categoryCrud.getInternalCategory(dataObject.video.categories)
				.then(videoCrud1_0_0.getNextVideos);
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
			return videoCrud1_0_0.getVideoCount(checkObject.user);
		})
		.then(function(videoCount) {
			dataObject.videoCount = videoCount;
			return videoCrud1_0_0.getTopSixVideos(checkObject.user);
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
			return categoryCrud.get();
		})
		.then(function(categories) {
			
			dataObject.categories = categories;
			params.data													= dataObject;
			params.data.videoPlayer							= {};
			params.data.videoPlayer.title				= "Video Player";
			params.data.videoPlayer.viewName		= "Video Player";
			params.data.url 										= config.baseUrl;
			params.data.facebookAppId 					= config.facebook.clientID;

			params.data.s3Bucket 								= amazonConfig.OUTPUT_BUCKET;
			return params;
	});

};

module.exports = VideoPlayerModel;