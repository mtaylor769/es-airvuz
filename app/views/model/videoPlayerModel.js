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
	var videoId         = '56fec7bb07354aaa096db3b8';
	var dataObject      = {};
	var sourceManifest	= params.sourceManifest;

	return videoCrud.getById(videoId)
		.then(function(video) {
			dataObject.video = video;
			videoId = video._id;
			return userCrud.getUserById(video.userId);
		})
		.then(function(user) {
			user.picture = 'https://scontent-ord1-1.xx.fbcdn.net/hphotos-xtf1/v/t1.0-9/12004767_1629862153963313_1943686358158111149_n.jpg?oh=d3d51baace10d6fbefb17b49ad9ad643&oe=57813952';
			dataObject.user = user;
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

			params.data.airvuz = {};
			params.data.vendor = {};
			params.data.airvuz.js = sourceManifest["airvuz.js"];
			params.data.airvuz.css = sourceManifest["airvuz.css"];
			params.data.vendor.js = sourceManifest["vendor.js"];
			logger.info(dataObject);
			return params;
	});

}

module.exports = VideoPlayerModel;