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

var UserProfileModel = function(params) {
	logger.debug("constructor: IN");	
	
	BaseModel.apply(this, arguments);
}

util.inherits(UserProfileModel, BaseModel);

UserProfileModel.prototype.getData = function(params) {	
	logger.info("getData ");	
	var sourceManifest	= params.sourceManifest;
	var THIS						= this;
	return new Promise(function(resolve, reject) {
		logger.info("getData 1.0");
		logger.info("getData sourceManifest['airvuz.css']:" + sourceManifest["airvuz.css"]);
		params.data													= {};		
		params.data.userProfile							= {};
		params.data.userProfile.title				= "User Profile";
		params.data.userProfile.airvuz			= {};
		params.data.userProfile.airvuz.css	= sourceManifest["airvuz.css"];
		params.data.userProfile.viewName		= "User Profile";		

		resolve(params);
	});  	

}

module.exports = UserProfileModel;