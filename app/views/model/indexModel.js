// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.model.index');

try {
	var BaseModel	= require('./baseModel');
	var Promise		= require('bluebird');
	var util			= require('util');

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
		
		
		params.data.index.head				= {};
		params.data.index.head.og			= {
			url : "http://www.airvuz.com"
		}
		params.data.index.viewName		= "Index PageV2";		
		
		
	/*
	        <meta property="og:url" content="http://airvuz.com/"/>
        <meta property="og:type" content="website" >
        <meta property="og:title" content="AirVūz – Drone Video Community" >
        <meta property="og:updated_time" content="1458850844571">
        <meta property="og:description" content="Discover, watch, and share aerial videos captured by cameras from drones, quadcopters, multi-copters, and radio controlled airplanes and helicopters." >
        <meta property="og:image" content="http://airvuz.com/assets/img/airvuz_banner.png" >
        <meta property="fb:app_id" content="441356432709973">
	 */	
		
		
		

		resolve(params);
	});  	

}

module.exports = IndexModel;