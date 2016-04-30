// IMPORT: BEGIN
var log4js							= require('log4js');
var logger							= log4js.getLogger('app.views.model.index');

try {
	var BaseModel					= require('./baseModel');
	var Promise						= require('bluebird');
	var util							= require('util');
	var usersCrud					= require('../../persistence/crud/users');
	var videoCrud					= require('../../persistence/crud/videos');
	var categoryCrud 			= require('../../persistence/crud/categoryType');

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
	var profileUser = null;
	var sourceManifest 		= params.sourceManifest;

	// TODO: run parallel
	return usersCrud.getUserByUserName(userName)
	.then(function(user) {
		profileUser = user;
		dataObject.user = user;
		return videoCrud.getShowcaseByUser(user._id)
	})
	.then(function(videos) {
		dataObject.showcase = videos;
		return categoryCrud.get();
	})
	.then(function (categories) {
		dataObject.categories = categories;
		return videoCrud.getByUser(profileUser._id);
	})
	.then(function(videos) {
		videos.forEach(function(video) {
			video.title = video.title.substring(0, 48);
			video.description = video.description.substring(0, 90);
			if(video.title.length === 48) {
				video.title = video.title + '...'
			}
			if(video.description.length === 90) {
				video.description = video.description + '...';
			}
		});
		dataObject.videos = videos;
		console.log(dataObject);
		params.data 												= dataObject;
		params.data.userProfile							= {};
		params.data.userProfile.title				= "User Profile";
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