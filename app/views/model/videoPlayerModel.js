// IMPORT: BEGIN
var namespace				= 'app.views.model.videoPlayerModel';
var log4js					= require('log4js');
var logger					= log4js.getLogger(namespace);


try {
	var BaseModel	    = require('./baseModel');
	var EventTrackingCrud			= require('../../persistence/crud/events/eventTracking');
	var Promise		    = require('bluebird');
	var util			    = require('util');
	var videoCrud     = require('../../persistence/crud/videos');
	var userCrud      = require('../../persistence/crud/users');
	var commentCrud   = require('../../persistence/crud/comment');
	var videoLikeCrud = require('../../persistence/crud/videoLike');
	var categoryCrud  = require('../../persistence/crud/categoryType');

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
			dataObject.video 	= video;
			checkObject.video = video._id;
			videoId 					= video._id;
			return userCrud.getUserById(video.userId);
		})
		.then(function(user) {
			console.log(user);
			user.picture 			= 'https://scontent-lga3-1.xx.fbcdn.net/hphotos-xta1/v/t1.0-9/10644863_520773331433556_7421786202668236448_n.jpg?oh=84dc5121c54e307a479dd5c67a9d9e2c&oe=57771A25';
			dataObject.user 	= user;
			checkObject.user  = user._id;
			return videoCrud.get5Videos();
		})
		.then(function(videos) {
			dataObject.upNext = videos;
			return videoLikeCrud.videoLikeCheck(checkObject)
		})
		.then(function(likeBoolean) {
			dataObject.likeBoolean = likeBoolean;
			return commentCrud.getParentCommentByVideoId({videoId: videoId});
		})
		.then(function (comments) {
			dataObject.comments = comments;
				return categoryCrud.get();
		})
		.then(function(categories) {
			console.log('completed all checks');
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
			return params;
	});

};

module.exports = VideoPlayerModel;