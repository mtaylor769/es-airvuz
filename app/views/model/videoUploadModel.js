// IMPORT: BEGIN
var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.videoUpload');


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

var VideoUploadModel = function(params) {
	logger.debug("constructor: IN");	
	
	BaseModel.apply(this, arguments);
};

util.inherits(VideoUploadModel, BaseModel);

VideoUploadModel.prototype.getData = function(params) {

	var sourceManifest	= params.sourceManifest;

	return new Promise(function(resolve, reject) {
		var dataObject											= {};

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
		params.data.airvuz.js		= sourceManifest["airvuz.js"];
		params.data.airvuz.css	= sourceManifest["airvuz.css"];
		params.data.vendor.js		= sourceManifest["vendor.js"];
		logger.info(dataObject);

		resolve(params);
	});

}

module.exports = VideoUploadModel;