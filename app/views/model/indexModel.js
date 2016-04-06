// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.model.index');

try {
	var BaseModel			= require('./baseModel');
	var CategoryType	= require('../../../app/persistence/crud/categoryType');
	var config				= require('../../../config/config')[global.NODE_ENV];
	var Promise				= require('bluebird');
	var util					= require('util');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");	
	}

	logger.info("import complete");	
}
catch(exception) {
	logger.error(" import error:" + exception);
}
// IMPORT: END

var IndexModel = function(params) {
	logger.debug("constructor: IN");	
	
	BaseModel.apply(this, arguments);
}

util.inherits(IndexModel, BaseModel);

IndexModel.prototype.getData = function(params) {	
	logger.info("getData ");	
	var sourceManifest	= params.sourceManifest;
	var THIS						= this;
	return new Promise(function(resolve, reject) {
		logger.info("getData 1.0");
		logger.info("getData sourceManifest['airvuz.css']:" + sourceManifest["airvuz.css"]);
		params.data										= {};
		
		
		params.data.index							= {};
		params.data.index.airvuz			= {};
		params.data.index.airvuz.css	= sourceManifest["airvuz.css"];
		params.data.index.airvuz.js		= sourceManifest["airvuz.js"];
		
		params.data.index.fb					= config.view.fb;
		
		params.data.index.head				= {};
		params.data.index.head.og			= config.view.index.og;
		params.data.index.head.title	= "AirVūz – Drone Video Community"
		params.data.index.viewName		= "index";		
		

		CategoryType
			.get()
			.then(function(data) {
				logger.debug("CategoryType.get() ...");
				resolve(params);
			})
			.catch(function(error) {
				reject(error);
			})

		
	});  	

}

module.exports = IndexModel;