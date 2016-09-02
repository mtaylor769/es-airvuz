// IMPORT: BEGIN
var log4js							= require('log4js');
var logger							= log4js.getLogger('app.views.model.userProfileModel');

try {
	var BaseModel					= require('./baseModel');
	var moment					  = require('moment');
	var util							= require('util');
	var unlock						= require('../../utils/unlockObject');
	var usersCrud					= require('../../persistence/crud/users');
	var videoCrud					= require('../../persistence/crud/videos');
	var socialCrud				= require('../../persistence/crud/socialMediaAccount');
	var categoryCrud 			= require('../../persistence/crud/categoryType');
	var videoCollection   = require('../../persistence/crud/videoCollection');
	var followCrud				= require('../../persistence/crud/follow');
	var amazonConfig			= require('../../config/amazon.config');

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
	var userNameUrl 						= params.request.params.userNameUrl;
	var dataObject 									= {};
	var profileUser 								= null;
	var sourceManifest 							= params.sourceManifest;
	// TODO: run parallel
	return usersCrud.getUserByUserNameUrl(userNameUrl)
	.then(function(user) {
		profileUser = user;
		return socialCrud.findByUserIdAndProvider(user._id, 'facebook')
			.then(function (social) {
				if (social) {
					user.facebook = true;
					user.fbAccount = social.accountId;
					return user;
				} else {
					return user;
				}
			});
	})
	.then(function(user) {
		logger.debug(user);
		if(user.facebook && user.profilePicture === ''){
			user.profilePicture = '//graph.facebook.com/' + user.fbAccount + '/picture?type=large';
		} else if(!user.facebook && user.profilePicture === '') {
			user.profilePicture = '/client/images/default.png';
		} else if(user.facebook && user.profilePicture.indexOf('facebook') > -1) {
			user.profilePicture = '//graph.facebook.com/' + user.fbAccount + '/picture?type=large';
		} else if(user.profilePicture.indexOf('http') === -1) {
			user.profilePicture = '/api/image/profile-picture' + user.profilePicture + '?size=200';
		} else {
			user.profilePicture = user.profilePicture;
		}
		if(user.coverPicture.indexOf('http') === -1) {
			user.coverPicture = amazonConfig.ASSET_URL + 'users/cover-pictures' + user.coverPicture;
		} else {
			user.coverPicture = user.coverPicture;
		}
		
		logger.debug(user);
		dataObject.user = user;
		return videoCollection.createVideoCollection({user: user._id, name: 'showcase'})
	})
	.then(function(videoCollection){
			var videos = videoCollection.videos;
			videos = unlock(videos);
			videos.forEach(function (video) {
				video.uploadDate = moment(video.uploadDate).fromNow();
				logger.debug(video);
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
				video.uploadDate = moment(video.uploadDate).fromNow();

			});
		} else {
			videos = null;
		}
		dataObject.videos 									= videos;
		
		params.data 												= dataObject;

		params.data.s3Bucket 								= amazonConfig.OUTPUT_URL;
		params.data.s3AssetUrl 							= amazonConfig.ASSET_URL;
		return params;
	});
};

module.exports = UserProfileModel;