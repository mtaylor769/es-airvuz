var namespace = 'app.views.model.userProfileModel';
// IMPORT: BEGIN
var log4js 					= require('log4js');
var logger 					= log4js.getLogger(namespace);

try {
	var BaseModel 			= require('./baseModel');
	var moment 				= require('moment');
	var util 				= require('util');
	var unlock 				= require('../../utils/unlockObject');
	var userCrud1_0_0 		= require('../../persistence/crud/users1-0-0');
	var videoCrud1_0_0 		= require('../../persistence/crud/videos1-0-0');
	var socialCrud 			= require('../../persistence/crud/socialMediaAccount');
	var catTypeCrud1_0_0 	= require('../../persistence/crud/categoryType1-0-0');
	var videoCollCrud1_0_0 	= require('../../persistence/crud/videoCollection1-0-0');
	var followCrud1_0_0 	= require('../../persistence/crud/follow1-0-0');
	var amazonConfig 		= require('../../config/amazon.config');

	if(global.NODE_ENV === "production") {
		logger.setLevel("INFO");
	}

	logger.info("import complete");	
}
catch(exception) {
	logger.error(" import error:" + exception);
}
// IMPORT: END

var UserProfileModel = function (params) {
	logger.debug("constructor: IN");

	BaseModel.apply(this, arguments);
};

util.inherits(UserProfileModel, BaseModel);

UserProfileModel.prototype.getData = function (params) {
	var userNameUrl = params.request.params.userNameUrl;
	var dataObject = {};
	var profileUser = null;
	var sourceManifest = params.sourceManifest;
	// TODO: run parallel
	return userCrud1_0_0.getUserByUserNameUrl(userNameUrl)
		.then(function (user) {
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
		.then(function (user) {
			logger.debug(user);
			if (user.facebook && user.profilePicture === '') {
				user.profilePicture = '//graph.facebook.com/' + user.fbAccount + '/picture?type=large';
			} else if (!user.facebook && user.profilePicture === '') {
				user.profilePicture = '/client/images/default.png';
			} else if (user.facebook && user.profilePicture.indexOf('facebook') > -1) {
				user.profilePicture = '//graph.facebook.com/' + user.fbAccount + '/picture?type=large';
			} else if (user.profilePicture.indexOf('http') === -1) {
				user.profilePicture = '/image/profile-picture' + user.profilePicture + '?size=200';
			} else {
				user.profilePicture = user.profilePicture;
			}
			if (user.coverPicture.indexOf('http') === -1) {
				user.coverPicture = amazonConfig.ASSET_URL + 'users/cover-pictures' + user.coverPicture;
			} else {
				user.coverPicture = user.coverPicture;
			}

			logger.debug(user);
			dataObject.user = user;
			return videoCollCrud1_0_0.createVideoCollection({user: user._id, name: 'showcase'})
		})
		.then(function (videoCollection) {
			var videos = videoCollection.videos;
			videos = unlock(videos);
			videos.forEach(function (video) {
				video.uploadDate = moment(video.uploadDate).fromNow();
				logger.debug(video);
			});
			dataObject.showcase = videos;
			return catTypeCrud1_0_0.get();
		})
		.then(function (categories) {
			if (!categories.length) {
				dataObject.categories = null;
			} else {
				dataObject.categories = categories;
			}
			return followCrud1_0_0.followingCount(profileUser._id);
		})
		.then(function (following) {
			dataObject.following = following;
			return followCrud1_0_0.followCount(profileUser._id);
		})
		.then(function (followers) {
			dataObject.followers = followers;
			return videoCrud1_0_0.getByUser(profileUser._id);
		})
		.then(function (videos) {
			if (videos.length) {
				videos = unlock(videos);
				videos.forEach(function (video) {
					var videoString = JSON.stringify(video._id);
					var showcaseString = JSON.stringify(dataObject.showcase);
					var check = showcaseString.indexOf(videoString);
					if (check !== -1) {
						video.isShowcase = true;
					} else {
						video.isShowcase = false
					}
					video.uploadDate = moment(video.uploadDate).fromNow();

				});
			} else {
				videos = null;
			}
			dataObject.videos = videos;

			params.data = dataObject;

			params.data.s3Bucket = amazonConfig.OUTPUT_URL;
			return params;
		});
};

module.exports = UserProfileModel;