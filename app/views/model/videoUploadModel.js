// IMPORT: BEGIN
var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.videoUpload');


try {
	var BaseModel	    = require('./baseModel');
	var Promise		    = require('bluebird');
	var util			    = require('util');
	var CategoryType  = require('../../persistence/crud/categoryType');

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

	params.data							= {};
	params.data.title				= "AirVūz – Upload";
	params.data.airvuz			= {};
	params.data.airvuz.css	= sourceManifest["airvuz.css"];
	params.data.airvuz.js   = sourceManifest["airvuz.js"];
	params.data.vendor      = {};
	params.data.vendor.js   = sourceManifest["vendor.js"];
	params.data.viewName		= "Upload";

	var promise = CategoryType.get()
			.then(function (categories) {
				params.data.categories = categories;
				return params;
			});

	return Promise.resolve(promise);
};

module.exports = VideoUploadModel;