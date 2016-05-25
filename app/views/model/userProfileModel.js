// IMPORT: BEGIN
var log4js							= require('log4js');
var logger							= log4js.getLogger('app.views.model.index');

try {
	var BaseModel					= require('./baseModel');
	var Promise						= require('bluebird');
	var util							= require('util');
	var unlock						= require('../../utils/unlockObject');
	var usersCrud					= require('../../persistence/crud/users');
	var videoCrud					= require('../../persistence/crud/videos');
	var categoryCrud 			= require('../../persistence/crud/categoryType');
	var videoCollection   = require('../../persistence/crud/videoCollection');
	var followCrud				= require('../../persistence/crud/follow')

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
	var userName 										= params.request.params.userName;
	var dataObject 									= {};
	var profileUser 								= null;
	var sourceManifest 							= params.sourceManifest;

	// TODO: run parallel
	return usersCrud.getUserByUserName(userName)
	.then(function(user) {
		profileUser = user;
		dataObject.user = user;
		return videoCollection.createVideoCollection({user: user._id, name: 'showcase'})
	})
	.then(function(collection) {
		return videoCollection.getCollectionVideos(dataObject.user._id, 'showcase');
	})
	.then(function(videoCollection){
			var videos = videoCollection.videos;
			videos.forEach(function (video) {
				video.title = video.title.substring(0, 48);
				video.description = video.description.substring(0, 90);
				if (video.title.length === 48) {
					video.title = video.title + '...';
				}
				if (video.description.length === 90) {
					video.description = video.description + '...';
				}
				console.log(video);
			});
		dataObject.showcase = videos;
		return categoryCrud.get();
	})
	.then(function (categories) {
		if (!categories.length) {
			dataObject.categories = null;
		} else {
			dataObject.categories = categories;
		}
		return followCrud.followingCount(profileUser._id);
	})
		.then(function(following){
			dataObject.following = following;
			return followCrud.followCount(profileUser._id);
		})
		.then(function(followers){
			dataObject.followers = followers;
			return videoCrud.getByUser(profileUser._id);
		})
	.then(function(videos) {
		if (videos.length) {
			videos = unlock(videos);
			videos.forEach(function(video) {
				var videoString = JSON.stringify(video._id);
				var showcaseString = JSON.stringify(dataObject.showcase);
				var check = showcaseString.indexOf(videoString);
				if(check !== -1) {
					video.isShowcase = true;
				} else {
					video.isShowcase = false
				}
				logger.debug(video.isShowcase);
				video.title = video.title.substring(0, 48);
				video.description = video.description.substring(0, 90);
				if(video.title.length === 48) {
					video.title = video.title + '...';
				}
				if(video.description.length === 90) {
					video.description = video.description + '...';
				}
			});
		} else {
			videos = null;
		}
		logger.debug(videos);
		dataObject.videos 									= videos;
		
		params.data 												= dataObject;
		params.data.userProfile							= {};
		params.data.userProfile.title				= "User Profile";
		params.data.userProfile.viewName		= "User Profile";

		params.data.airvuz 									= {};
		params.data.vendor 									= {};
		params.data.airvuz.js 							= sourceManifest["airvuz.js"];
		params.data.airvuz.css 							= sourceManifest["airvuz.css"];
		params.data.vendor.js 							= sourceManifest["vendor.js"];
		return params;
	});
};

module.exports = UserProfileModel;