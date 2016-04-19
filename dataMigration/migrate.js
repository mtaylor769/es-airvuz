"use strict";
try {
	var log4js											= require('log4js');
	var logger											= log4js.getLogger("dataMigration.migrate");
	var loggerUsers									= log4js.getLogger("dataMigration.migrate:MigrateUsers");
	var loggerUserUtils							= log4js.getLogger("dataMigration.migrate:UserUtils");

	var database										= require('../app/persistence/database/database');

	var Promise											= require('bluebird');
	var util												= require('util');
	
	// Version 1
	var Channel_v1									= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.airvuz_v1.channel" });
	var Users_v1										= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.airvuz_v1.users" });
	var Videos_v1										= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.airvuz_v1.videos" });
	
	// Version 2
	var Users_v2										= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.users" });
	var Videos_v2										= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.videos" });
	
	var usersCrud										= require('../app/persistence/crud/users');
	var videosCrud									= require('../app/persistence/crud/videos');
	

} 
catch(exception) {
	logger.error(" import error:" + exception);
}

logger.debug("BEG: migrate");

var emailAddressIsNoUrlCount = 0;

var exists = function(value) {
	if(
		(typeof(value) !== "undefined")
		&& (value !== null)
	) {
		return(true);
	}
	return(false);
}

/*
var isValidAccount = function(user) {
	if(
		(user.loginCount === 0)
		&& !hasFacebookAccount(user)
		&& !hasGoogleAccount(user)
	) {
		return(false);
	}
	return(true);
}
*/

var hasFacebookAccount = function(user) {
	if(exists(user.facebook)) {
		return(true);
	}
	return(false);
}

var hasGoogleAccount = function(user) {
	if(exists(user.google)) {
		return(true);
	}
	return(false);
}

// UserUtils: ------------------------------------------------------------------

var UserUtils = function() {
	
}

UserUtils.prototype.getEmailAddress = function(user_p) {
	var emailAddress = null;
	
	if(exists(user_p.email)) {
		emailAddress = user_p.email;
	}
	
	if(emailAddress === null) {
		emailAddress = "";
		loggerUserUtils.debug(".getEmailAddress: getEmailAddress not found _id:" + user_p._id + " setting to ''");
	}
	
	return(emailAddress);
}

UserUtils.prototype.getFirstName = function(user_p) {
	var firstName = null;
	
	if(exists(user_p.first_name)) {
		firstName = user_p.first_name;
	}
	else {
		if(hasFacebookAccount(user_p)) {
			if(exists(user_p.facebook.first_name)) {
				firstName = user_p.facebook.first_name;
			}
		}
		else if(hasGoogleAccount(user_p)) {
			if(exists(user_p.google.name.givenName)) {
				firstName = user_p.google.name.givenName;
			}
		}
	}
	
	if(firstName === null) {
		firstName = "";
		//loggerUserUtils.debug(".getFirstName: firstName not found _id:" + user_p._id + " setting to ''");
		//loggerUserUtils.debug(".getFirstName: firstName not found: " + JSON.stringify(user_p, null, 2));
	}
	return(firstName);
}

UserUtils.prototype.getLastName = function(user_p) {
	var lastName = null;
	
	if(exists(user_p.last_name)) {
		lastName = user_p.last_name;
	}
	else {
		if(hasFacebookAccount(user_p)) {
			if(exists(user_p.facebook.last_name)) {
				lastName = user_p.facebook.last_name;
			}
		}
		else if(hasGoogleAccount(user_p)) {
			if(exists(user_p.google.name.familyName)) {
				lastName = user_p.google.name.familyName;
			}
		}
	}
	
	if(lastName === null) {
		lastName = "";
		//loggerUserUtils.debug(".getLastName: lastName not found _id:" + user_p._id + " setting to ''");
		//loggerUserUtils.debug(".getLastName: lastName not found: " + JSON.stringify(user_p, null, 2));
	}
	
	return(lastName);
}

UserUtils.prototype.getUserName = function(user_p) {
	var userName = null;
	
	if(exists(user_p.user_name)) {
		userName = user_p.user_name;
	}
	else if(exists(user_p.fbUserName)) {
		userName = user_p.fbUserName;
	}
	else if(exists(user_p.urlName)) {
		userName = user_p.urlName;
	}	
	
	
	if(userName === null) {
		userName = "";
		//loggerUserUtils.debug(".getUserName: userName not found _id:" + user_p._id + " setting to ''");
		//loggerUserUtils.debug(".getUserName: userName not found: " + JSON.stringify(user_p, null, 2));
	}
	else {
		//loggerUserUtils.debug(".getUserName: userName:" + userName);
	}
	
	return(userName);
}


UserUtils = new UserUtils();
// UserUtils: ==================================================================


var AppendChannel = function(user_p) {
	logger.debug(".AppendChannel: BEG");
	return(new Promise(function(resolve, reject) {

			Channel_v1
				.findOne({ User: user_p._id})
				.exec()
				.then(function(channel) {
					logger.debug(".AppendChannel: Found a channel");

					if(exists(channel)) {
						logger.debug(".AppendChannel: channel exists");
						user_p.channel = channel;
						resolve(user_p);
						return;
						//loggerUserUtils.debug(".AppendChannel: " + JSON.stringify(channel, null, 2));
					};
					user_p.channel = null;
					resolve(user_p);
					return;
				})
				.catch(function(error) {
					logger.debug(".AppendChannel error:" + error);
					reject(error);
					return;
				});

			
		})
	);
}

var AppendVideos = function(user_p) {
	return(new Promise(function(resolve, reject) {
				//loggerUserUtils.debug(".AppendVideos: 0");
				if(
					exists(user_p.channel)
					&& exists(user_p.channel._id)
				) {				
					Videos_v1
						.find({ Channel: user_p.channel._id})
						.exec()
						.then(function(videos) {
							//loggerUserUtils.debug(".AppendVideos: 2");
							//loggerUserUtils.debug(".AppendVideos: user_p.channel._id:" + user_p.channel._id + " got video array:");
							if(exists(videos)) {
								//loggerUserUtils.debug(".AppendVideos: 2.5");
								//loggerUsers.debug("BEG: exists(channel):" + channel._id);
								//loggerUserUtils.debug(".AppendVideos: " + JSON.stringify(videos, null, 2));
								user_p.videos = videos;
								//loggerUserUtils.debug(".AppendVideos: 2.6");
								//loggerUserUtils.debug(".AppendVideos: user_p.videos:" + JSON.stringify(user_p.videos, null, 2));
								//loggerUserUtils.debug(".AppendVideos: user_p._id:" + user_p._id + ", user_p.videos.length:" + user_p.videos.length);
								resolve(user_p);
								return;
							};
							user_p.videos = [];
							resolve(user_p);
							return;
						})
						.catch(function(error) {
							//loggerUserUtils.debug(".AppendVideos: 3");
							//loggerUsers.error("AppendVideos error:" + error);
							error.appendType = "AppendVideos";
							reject(error);
							return;
						});				

				}
				else if(user_p.channel === null) {
					//loggerUserUtils.debug(".AppendVideos: 4");
					//loggerUserUtils.debug(".AppendVideos: user_p.channel === null");
				}
				//resolve(user_p);
				//return;
		})
	);

}



var MigrateUser = function(user_p) {
	
	return(new Promise(function(resolve, reject) {
			var newUserData							= {};

			newUserData.firstName				= UserUtils.getFirstName(user_p);
			newUserData.lastName				= UserUtils.getLastName(user_p);
			newUserData.userName				= UserUtils.getUserName(user_p);
			newUserData.emailAddress		= UserUtils.getEmailAddress(user_p);
						
			if(newUserData.emailAddress === "no@url.com") {
				emailAddressIsNoUrlCount++;
				newUserData.emailAddress = newUserData.emailAddress + emailAddressIsNoUrlCount;
			}
			
			if(
				(newUserData.emailAddress === "jennymirkovic@gmail.com")
				&& (user_p.user_type === "admin")
			) {
				newUserData.emailAddress = "jenny@airvuz.com";
			}
			
			//loggerUserUtils.error(".MigrateUser:" + JSON.stringify(newUserData, null, 2));
			
			usersCrud
				.create(newUserData)
				.then(function(savedUser) {
					resolve(savedUser);
					return;
				});

		})
	);	

}




var MigrateVideos = function(savedUser_p, origUserData_p) {
	return(new Promise(function(resolve, reject) {	
	
			var newVideoData		= null;
			var video						= null;
			var videoIndex			= 0; 
			var videoSize				= origUserData_p.videos.length;
			var savedVideoCount = 0;


			for(videoIndex = 0; videoIndex < videoSize; videoIndex++) {
				video					= origUserData_p.videos[videoIndex];
				newVideoData	= {};

				newVideoData.description			= video.Description || "Drone Video";
				newVideoData.duration					= video.Duration;
				newVideoData.thumbnailPath		= video.Thumbnail || null;
				newVideoData.title						= video.Title || "Drone Video";
				newVideoData.userId						= savedUser_p;
				newVideoData.videoPath				= video.FileName;
				


				//loggerUserUtils.debug(".MigrateVideo origVideoData: " + JSON.stringify(video, null, 2));
				//loggerUserUtils.debug(".MigrateVideo newVideoData: " + JSON.stringify(newVideoData, null, 2));

				if(newVideoData.thumbnailPath === null) {
					savedVideoCount++;
				}
				else {
					
					(function(newVideoData, oldVideoData) {

						videosCrud
							.create(newVideoData)
							.then(function(savedVideo) {
								savedVideoCount++;
								loggerUsers.debug(".MigrateVideos: savedVideoCount:" + savedVideoCount + ", videoSize:" + videoSize);
								if(savedVideoCount === videoSize) {
									loggerUsers.debug(".MigrateVideos: all videos saved");
									resolve();
								}
							})
							.catch(function(error) {
								var errorToString = util.inspect(error, {showHidden: false, depth: null});
								loggerUsers.error(".MigrateVideos: descriptionWasForced:" + descriptionWasForced);
								loggerUsers.error(".MigrateVideos: error:" + errorToString);
								loggerUsers.error(".MigrateVideos: error - newVideoData" + JSON.stringify(newVideoData, null, 2));
								loggerUsers.error(".MigrateVideos: error - oldVideoData" + JSON.stringify(oldVideoData, null, 2));
							});					

					})(newVideoData, video)
					
				}



				/*
				videosCrud
					.create(newVideoData)
					.then(function(savedVideo) {
						savedVideoCount++;
						loggerUsers.debug(".MigrateVideos: savedVideoCount:" + savedVideoCount + ", videoSize:" + videoSize);
						if(savedVideoCount === videoSize) {
							loggerUsers.debug(".MigrateVideos: all videos saved");
							resolve();
						}
					})
					.catch(function(error) {
						var errorToString = util.inspect(error, {showHidden: false, depth: null});
						loggerUsers.debug(".MigrateVideos: error:" + errorToString);
					});
					*/

			}
	
		})
	);	
	
}

/*
var MigrateVideos = function(savedUser_p, origUserData_p) {
	var newVideoData		= null;
	var video						= null;
	var videoIndex			= 0; 
	var videoSize				= origUserData_p.videos.length;
	var savedVideoCount = 0;
	
	
	for(videoIndex = 0; videoIndex < videoSize; videoIndex++) {
		video					= origUserData_p.videos[videoIndex];
		newVideoData	= {};
		
		newVideoData.description			= video.Description;
		newVideoData.duration					= video.Duration;
		newVideoData.thumbnailPath		= video.Thumbnail;
		newVideoData.title						= video.Title;
		newVideoData.userId						= savedUser_p;
		newVideoData.videoPath				= video.FileName;
		
		//loggerUserUtils.debug(".MigrateVideo origVideoData: " + JSON.stringify(video, null, 2));
		//loggerUserUtils.debug(".MigrateVideo newVideoData: " + JSON.stringify(newVideoData, null, 2));
		
		videosCrud
			.create(newVideoData)
			.then(function(savedVideo) {
				savedVideoCount++;
				loggerUsers.debug(".MigrateVideos: savedVideoCount:" + savedVideoCount + ", videoSize:" + videoSize);
				if(savedVideoCount === videoSize) {
					loggerUsers.debug(".MigrateVideos: all videos saved");
					resolved();
				}
			})
			.catch(function(error) {
				var errorToString = util.inspect(error, {showHidden: false, depth: null});
				loggerUsers.debug(".MigrateVideos: error:" + errorToString);
			});
		
	}
	
}
*/


var MergeUsers = function(users_p) {
	var users_m = [];
	
	return(new Promise(function(resolve, reject) {


		})
	);	
	
}

var LoadAllUserData = function() {
	logger.debug(".LoadAllUserData: BEG");
	return(new Promise(function(resolve, reject) {
		var users_m											= [];
		var appendVideoCallCount				= 0;
		var appendVideoCallbackCount		= 0;
		
		Users_v1
			.find({})
			.exec()
			.then(function(users) {			
				logger.debug(".LoadAllUserData:" + users.length);
				var user									= null;
				var userIndex							= 0;
				var userSize							= users.length;
				var userVideoLoadedCount	= 0;

				for(userIndex = userIndex; userIndex < userSize; userIndex++) {
					user			= users[userIndex];

					logger.debug(".LoadAllUserData index:" + userIndex);
					AppendChannel(user)
						.then(function(user) {
							appendVideoCallCount++;
							logger.debug(".LoadAllUserData appending video call data count:" + appendVideoCallCount);
							return(AppendVideos(user));
						})
						.then(function(user) {
							appendVideoCallbackCount++;
							logger.debug(".LoadAllUserData appending video callback data count:" + appendVideoCallbackCount);
							logger.debug(".LoadAllUserData all user video data has been loaded");
							users_m.push(user);
							userVideoLoadedCount++;
							if(userVideoLoadedCount === userSize) {
								logger.debug(".LoadAllUserData all user video data has been loaded");
								logger.debug(".LoadAllUserData: END");
								resolve(users_m);
							}
						})
						.catch(function(error) {
							var errorToString = util.inspect(error, {showHidden: false, depth: null});
							logger.debug(".LoadAllUserData error:" + errorToString);
							reject(error);
						})

				}

			});

		})
	);	
}

var CleanDestination = function() {
	logger.debug(".CleanDestination: BEG");
	return(new Promise(function(resolve, reject) {

		Users_v2
			.find({})
			.remove(function(error) {
				if(error) {
					logger.error(".CleanDestination: error removing V2 Users.");
					reject(error);
				}
				else {
					logger.debug(".CleanDestination: removed V2 Users");
					
					Videos_v2
						.find({})
						.remove(function(error) {
							if(error) {
								logger.error(".CleanDestination: error removing V2 Videos.");
								reject(error);
							}	
							else {
								logger.debug(".CleanDestination: removed V2 Videos");
								logger.debug(".CleanDestination: END");
								resolve();
							}
						});
					
				}
			});

		})
	);	

}

var MigrateData = function() {
	logger.debug(".MigrateData: BEG");
	
	CleanDestination()
		.then(function() {
			LoadAllUserData()
				.then(function(users_p) {
					logger.debug(".MigrateData: users.length:" + users_p.length);
				}).catch(function(error) {
					
				});
			logger.debug(".MigrateData: END");
		})
		.catch(function(error) {
			logger.error(".MigrateData error:" + error);
			logger.debug(".MigrateData: END");
			reject(error);
		})
	
	
	
}

var MigrateUsers = function() {
	
}

MigrateUsers.prototype.execute = function() {
	loggerUsers.debug("BEG: MigrateUsers.execute");
	
	loggerUsers.debug(".execute : starting with an empty V2 user collection");
	Users_v2
		.find({})
		.remove(function(error) {
			if(error) {
				loggerUsers.debug(".execute : error removing users v2 documents: " + error);
			}
		});
		
	Videos_v2
		.find({})
		.remove(function(error) {
			if(error) {
				loggerUsers.debug(".execute : error removing video v2 documents: " + error);
			}		
		});
	
	LoadAllUserData().then(function(users_p) {
		
	});
	
	/*
	Users_v1
		.find({})
		.exec()
		.then(function(users) {			
			loggerUsers.debug("BEG: user count:" + users.length);
			var user			= null;
			var userIndex = 0;
			var userSize	= users.length;
			var userInfo	= null;
			var invalidAccountSize = 0;
			
			for(userIndex = userIndex; userIndex < userSize; userIndex++) {
				user			= users[userIndex];
				
				loggerUsers.debug("saving user #:" + userIndex);
				
				AppendChannel(user)
					.then(function(user) {
						//loggerUsers.debug("BEG: got appended channel");
						return(AppendVideos(user));
					})
					.then(function(user) {
						MigrateUser(user).
							then(function(savedUser) {
								return(MigrateVideos(savedUser, user));
							})
					})
					.catch(function(error) {
						var errorToString = util.inspect(error, {showHidden: false, depth: null});
						loggerUsers.error(".execute error:" + errorToString);
					})
				
				

				//userInfo	= GetUserNames(user);
			}
		

			loggerUsers.debug("END");
			
			
		});
		*/
		
		
	
/*
		UsersModel.find({}).exec()
		.then(function(allUsers){
			var param = {
				status 	: "200",
				message : "Okay",
				users 	: allUsers
			};
			resolve(param);
		})
		.error(function(e) {
			var errorMessage		= new ErrorMessage();
			errorMessage.getErrorMessage({
				statusCode			: "500",
				errorId 				: "PERS1000",
				errorMessage 		: "Failed while getting users",
				sourceError			: e,
				sourceLocation	: "persistence.crud.Users.getAllAusers"
			});
			reject(errorMessage.getErrors());
		});
 */	
	
	
	
}

setTimeout(function() {
		//new MigrateUsers().execute();
		MigrateData();
	}, 100
);


