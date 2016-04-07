// IMPORT: BEGIN
var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.index');


try {
	var BaseModel	= require('./baseModel');
	var Promise		= require('bluebird');
	var util			= require('util');
	var videoCrud = require('../../persistence/crud/videos');
	var userCrud  = require('../../persistence/crud/users');
	var commentCrud = require('../../persistence/crud/comment');

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
		dataObject.user = user;
		return videoCrud.get5Videos();
	})
	.then(function(videos) {
		dataObject.upNext = videos;
		return commentCrud.getParentCommentByVideoId({videoId: videoId});
	})
	.then(function(comments) {
		dataObject.comments = comments;
		params.data													= dataObject;
		params.data.videoPlayer							= {};
		params.data.videoPlayer.title				= "Video Player";
		params.data.videoPlayer.airvuz			= {};
		params.data.videoPlayer.airvuz.css	= sourceManifest["airvuz.css"];
		params.data.videoPlayer.viewName		= "Video Player";
		logger.info(dataObject);
		return params;
	});
		logger.info("getData 1.0");
		logger.info("getData sourceManifest['airvuz.css']:" + sourceManifest["airvuz.css"]);

}

module.exports = VideoPlayerModel;