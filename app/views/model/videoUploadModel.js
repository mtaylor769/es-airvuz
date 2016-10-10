// IMPORT: BEGIN
var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.videoUploadModel');


try {
	var BaseModel	    	= require('./baseModel');
	var Promise		    	= require('bluebird');
	var util			    = require('util');
	var catTypeCrud1_0_0  	= require('../../persistence/crud/categoryType1-0-0');

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
	params.data							= {};
	params.data.title				= "AirVūz – Upload";
	params.data.viewName		= "Upload";

	var promise = catTypeCrud1_0_0.get()
			.then(function (categories) {
				params.data.categories = categories;
				return params;
			});

	return Promise.resolve(promise);
};

module.exports = VideoUploadModel;