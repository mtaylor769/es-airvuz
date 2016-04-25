// IMPORT: BEGIN
var log4js							= require('log4js');
var logger							= log4js.getLogger('app.views.model.index');

try {
	var BaseModel					= require('./baseModel');
	var Promise						= require('bluebird');
	var util							= require('util');
	var usersCrud					= require('../../persistence/crud/users');
	var videoCrud					= require('../../persistence/crud/videos');

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
};

util.inherits(UserProfileModel, BaseModel);

UserProfileModel.prototype.getData = function(params) {
	var userName = params.request.params.userName;
	var dataObject = {};
	var sourceManifest 		= params.sourceManifest;

	return usersCrud.getUserByUserName(userName)
	.then(function(user) {
		dataObject.user = user;
		return videoCrud.getByUser(user._id)
	})
	.then(function(videos) {
		dataObject.videos = videos;
		console.log(dataObject);
		params.data 												= dataObject;
		params.data.userProfile							= {};
		params.data.userProfile.title				= "User Profile";
		params.data.userProfile.airvuz			= {};
		params.data.userProfile.airvuz.css	= sourceManifest["airvuz.css"];
		params.data.userProfile.viewName		= "User Profile";

		params.data.airvuz 									= {};
		params.data.vendor 									= {};
		params.data.airvuz.js 							= sourceManifest["airvuz.js"];
		params.data.airvuz.css 							= sourceManifest["airvuz.css"];
		params.data.vendor.js 							= sourceManifest["vendor.js"];
		console.log(params.data.userProfile);
		return params;
	});
};

module.exports = UserProfileModel;