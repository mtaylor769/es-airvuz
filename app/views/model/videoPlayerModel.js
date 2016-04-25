// IMPORT: BEGIN
var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.index');


try {
	var BaseModel	    = require('./baseModel');
	var Promise		    = require('bluebird');
	var util			    = require('util');
	var videoCrud     = require('../../persistence/crud/videos');
	var userCrud      = require('../../persistence/crud/users');
	var commentCrud   = require('../../persistence/crud/comment');

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
	var sourceManifest	= params.sourceManifest;

	return videoCrud.getById(videoId)
		.then(function(video) {
			dataObject.video 	= video;
			videoId 					= video._id;
			return userCrud.getUserById(video.userId);
		})
		.then(function(user) {
			console.log(user);
			user.picture 			= 'https://scontent-lga3-1.xx.fbcdn.net/hphotos-xta1/v/t1.0-9/10644863_520773331433556_7421786202668236448_n.jpg?oh=84dc5121c54e307a479dd5c67a9d9e2c&oe=57771A25';
			dataObject.user 	= user;
			return videoCrud.get5Videos();
		})
		.then(function(videos) {
			dataObject.upNext = videos;
			return commentCrud.getParentCommentByVideoId({videoId: videoId});
		})
		.then(function(comments) {
			console.log('completed all checks');
			dataObject.comments = comments;
			params.data													= dataObject;
			params.data.videoPlayer							= {};
			params.data.videoPlayer.title				= "Video Player";
			params.data.videoPlayer.airvuz			= {};
			params.data.videoPlayer.airvuz.css	= sourceManifest["airvuz.css"];
			params.data.videoPlayer.airvuz.js   = sourceManifest["airvuz.js"];
			params.data.videoPlayer.vendor      = {};
			params.data.videoPlayer.vendor.js   = sourceManifest["vendor.js"];
			params.data.videoPlayer.viewName		= "Video Player";

			params.data.airvuz 									= {};
			params.data.vendor 									= {};
			params.data.airvuz.js 							= sourceManifest["airvuz.js"];
			params.data.airvuz.css 							= sourceManifest["airvuz.css"];
			params.data.vendor.js 							= sourceManifest["vendor.js"];
			return params;
	});

}

module.exports = VideoPlayerModel;