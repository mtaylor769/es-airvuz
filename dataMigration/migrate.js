"use strict";
try {
	var log4js 			= require('log4js');
	var logger 			= log4js.getLogger("dataMigration.migrate");
	var loggerUsers 	= log4js.getLogger("dataMigration.migrate:MigrateUsers");
	var loggerUserUtils = log4js.getLogger("dataMigration.migrate:UserUtils");
	var database 		= require('../app/persistence/database/database');
	var Promise 		= require('bluebird');
	var util 			= require('util');

	// Version 1
	var Channel_v1 		= database.getModelByDotPath({modelDotPath: "app.persistence.model.airvuz_v1.channel"});
	var Users_v1 		= database.getModelByDotPath({modelDotPath: "app.persistence.model.airvuz_v1.users"});
	var Videos_v1 		= database.getModelByDotPath({modelDotPath: "app.persistence.model.airvuz_v1.videos"});

	// Version 2
	var Users_v2 		= database.getModelByDotPath({modelDotPath: "app.persistence.model.users"});
	var Videos_v2 		= database.getModelByDotPath({modelDotPath: "app.persistence.model.videos"});

	var usersCrud1_0_0 	= require('../app/persistence/crud/users1-0-0');
	var videoCrud1_0_0 	= require('../app/persistence/crud/videos1-0-0');
	

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

UserUtils.prototype.getCoverPicture = function(user_p) {
	var coverPicture = null;
	
	if(exists(user_p.cover_picture)) {
		coverPicture = user_p.cover_picture;
	}
	else {
		coverPicture = "default";
	}
	
	return(coverPicture);
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

UserUtils.prototype.getProfilePicture = function(user_p) {
	var profilePicture = null;
	
	if(exists(user_p.profile_picture)) {
		profilePicture = user_p.profile_picture;
	}
	else {
		profilePicture = "";
	}
	
	return(profilePicture);
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
/*
var AggregateUserData = function(user_p) {
	logger.debug(".AggregateUserData: BEG");
	return(new Promise(function(resolve, reject) {


			
		})
	);
}
*/

/*
 * AppendChannel
 */
var AppendChannel = function(user_p) {
	//logger.debug(".AppendChannel: BEG");
	return(new Promise(function(resolve, reject) {

			Channel_v1
				.findOne({ User: user_p._id})
				.exec()
				.then(function(channel) {
					//logger.debug(".AppendChannel: Found a channel");
					user_p.channel = null;
					if(exists(channel)) {
						//logger.debug(".AppendChannel: channel exists");
						user_p.channel = channel;
						resolve(user_p);
						return;
						//loggerUserUtils.debug(".AppendChannel: " + JSON.stringify(channel, null, 2));
					};
					
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

/*
 * AppendChannels
 */
var AppendChannels = function(users_p) {
	logger.debug(".AppendChannels: BEG");
	return(new Promise(function(resolve, reject) {
			var users_m						= [];
			var callBackCount			= 0;
			var userIndex					= 0;
			var userSize					= users_p.length;
			var user							= null;
			
			for(userIndex = 0; userIndex < userSize; userIndex++) {
				user = users_p[userIndex];
				
				AppendChannel(user)
					.then(function(user_p) {
						callBackCount++;
						//logger.debug(".AppendChannels: user_p.channel:" + user_p.channel);
						users_m.push(user_p);
						if(callBackCount === userSize) {
							logger.debug(".AppendChannels: all callbacks complete");
							logger.debug(".AppendChannels: END");
							resolve(users_m);
						}
					}).catch(function(error) {
						logger.debug(".AppendChannels: error:" + error);
						reject(error);
					});

			}

		})
	);
}



/*
 * AppendVideo
 */
var AppendVideo = function(user_p) {
	return(new Promise(function(resolve, reject) {

				if(
					exists(user_p.channel)
					&& exists(user_p.channel._id)
				) {				
					Videos_v1
						.find({ Channel: user_p.channel._id})
						.exec()
						.then(function(videos) {
							user_p.videos = [];
							if(exists(videos)) {
								user_p.videos = videos;
								//logger.debug(".AppendVideo: user_p.video.length:" + user_p.videos.length);
								resolve(user_p);
								return;
							};
							
							resolve(user_p);
							return;
						})
						.catch(function(error) {
							//logger.debug(".AppendVideo: error:" + error);
							logger.error(".AppendVideo: error:" + error);
							reject(error);
							return;
						});				

				}
				else if(user_p.channel === null) {
					resolve(user_p);
				}
		})
	);

}

/*
 * AppendVideos
 */
var AppendVideos = function(users_p) {
	logger.debug(".AppendVideos: BEG");
	return(new Promise(function(resolve, reject) {
			var users_m						= [];
			var callBackCount			= 0;
			var userIndex					= 0;
			var userSize					= users_p.length;
			var user							= null;
			
			for(userIndex = 0; userIndex < userSize; userIndex++) {
				user = users_p[userIndex];
				
				AppendVideo(user)
					.then(function(user_p) {
						callBackCount++;
						//logger.debug(".AppendChannels: user_p.channel:" + user_p.channel);
						users_m.push(user_p);
						if(callBackCount === userSize) {
							logger.debug(".AppendVideos: all callbacks complete");
							logger.debug(".AppendVideos: END");
							resolve(users_m);
						}
					}).catch(function(error) {
						logger.debug(".AppendVideos: error:" + error);
						reject(error);
					});

			}

		})
	);
}



/*
 * CleanDestination
 */
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

var MergeUserAccounts = function(user_ary_p) {
	logger.debug(".MergeUserAccounts: BEG");
	var user					= null;
	var account				= null;
	var accountIndex	= 0;
	var accountSize		= user_ary_p.length;
	
	for(accountIndex = 0; accountIndex < accountSize; accountIndex++) {
		account = user_ary_p[accountIndex];
		
		logger.debug(".MergeUserAccounts: account.videos.length: " + account.videos);
		logger.debug(".MergeUserAccounts:" + JSON.stringify(account, null, 2));
		
	}
	
	logger.debug(".MergeUserAccounts: END");
	return(user);
}

/*
 * MergeUsers
 */
var MergeUsers = function(users_p) {
	logger.debug(".MergeUsers: BEG");
	logger.error(".MergeUsers: STILL NEED TO FIX MERGING OF USER ACCOUNTS");
	MergeUsers_fixEmail_nourl(users_p);

	var key										= null;
	var emailAddress					= null;
	var emailAddressKeys			= [];
	var user									= null;
	var usersTempAry					= [];
	var users_m								= [];
	//var usersById		= {};
	var usersByEmailAddress		= {};

	var userIndex							= 0;
	var userSize							= users_p.length;
	
	// get a hash of email addresses, each its own array
	for(userIndex = 0; userIndex < userSize; userIndex++) {
		user					= users_p[userIndex];
		emailAddress	= user.email || "";
		
		if(!exists(usersByEmailAddress[emailAddress])) {
			usersByEmailAddress[emailAddress] = [];
			usersByEmailAddress[emailAddress].push(user);
		}
		else {
			//logger.debug(".MergeUsers: dup");
			usersByEmailAddress[emailAddress].push(user);
		}
	}
	
	emailAddressKeys	= Object.keys(usersByEmailAddress);
	userSize					= emailAddressKeys.length;
	logger.debug(".MergeUsers: emailAddressKeys size: " + userSize);
	
	for(userIndex = 0; userIndex < userSize; userIndex++) {
		key						= emailAddressKeys[userIndex];
		usersTempAry	= usersByEmailAddress[key];
		
		if(usersTempAry.length === 1) {
			user = usersTempAry[0];
			users_m.push(user);
		}
		else if(usersTempAry.length > 1) {
			//user = MergeUserAccounts(usersTempAry);
			//logger.debug(".MergeUsers: email: [" + key + "] usersTempAry.length: " + usersTempAry.length);
		}
	}

	logger.debug(".MergeUsers: END");
	return(users_m);
}

var MergeUsers_fixEmail_nourl = function(users_p) {
	logger.debug(".MergeUsers_fixEmail_nourl: BEG");
	
	var noUrlCount	= 0;
	var user				= null;
	var userIndex		= 0;
	var userSize		= users_p.length;
	
	for(userIndex = 0; userIndex < userSize; userIndex++) {
		user = users_p[userIndex];
		
		user.email = user.email || null;
		if(user.email === "no@url.com") {
			user.email = "no" + noUrlCount + "@url.com";
			noUrlCount++;
		}

	}
	
	logger.debug(".MergeUsers_fixEmail_nourl: fixed: " + noUrlCount);
	
	logger.debug(".MergeUsers_fixEmail_nourl: END");
}

var MigrateUser = function(userV1_p) {
	//logger.debug(".MigrateUser: BEG");
	return(new Promise(function(resolve, reject) {

			Users_v2.find({ userName : userV1_p.user_name})
				.exec()
				.then(function(user){
					if(user) {

						//logger.debug(".MigrateUser: createNewUser");
						var newUserData								= {};
						var emailAddressIsNoUrlCount	= 0;

						newUserData.coverPicture			= UserUtils.getCoverPicture(userV1_p);
						newUserData.firstName					= UserUtils.getFirstName(userV1_p);
						newUserData.lastName					= UserUtils.getLastName(userV1_p);
						newUserData.userName					= UserUtils.getUserName(userV1_p);
						newUserData.emailAddress			= UserUtils.getEmailAddress(userV1_p);
						newUserData.profilePicture		= UserUtils.getProfilePicture(userV1_p);
						
						// TODO: use their password
						newUserData.password					= "airvuz1234";
						
						
						
						if(newUserData.emailAddress === "no@url.com") {
							emailAddressIsNoUrlCount++;
							newUserData.emailAddress = newUserData.emailAddress + emailAddressIsNoUrlCount;
						}

						if(
							(newUserData.emailAddress === "jennymirkovic@gmail.com")
							&& (userV1_p.user_type === "admin")
						) {
							newUserData.emailAddress = "jenny@airvuz.com";
						}

						//loggerUserUtils.error(".MigrateUser:" + JSON.stringify(newUserData, null, 2));

						usersCrud1_0_0
							.create(newUserData)
							.then(function(savedUser) {
								resolve(savedUser);
								return;
							});								
						
						
					}
					else {
					
						logger.debug(".MigrateUser: duplicate username");
					
					}
					
				});

						

				
				

		})
	);	

}




var MigrateVideos = function(savedUser_p, origUserData_p) {
	logger.debug(".MigrateVideos: BEG");
	//logger.debug(".MigrateVideos: origUserData_p: " + JSON.stringify(origUserData_p, null, 2));
	return(new Promise(function(resolve, reject) {	
	
			var newVideoData		= null;
			var video						= null;
			var videoIndex			= 0; 
			var videoSize				= origUserData_p.videos.length;
			var savedVideoCount = 0;
			
			logger.debug(".MigrateVideos: videoSize: " + videoSize);

			for(videoIndex = 0; videoIndex < videoSize; videoIndex++) {
				video					= origUserData_p.videos[videoIndex];
				newVideoData	= {};

				newVideoData.description			= video.Description || "Drone Video";
				newVideoData.duration					= video.Duration;
				newVideoData.likeCount				= video.Like;
				newVideoData.recordDate				= video.RecordDate;
				newVideoData.thumbnailPath		= video.Thumbnail || null;
				newVideoData.title						= video.Title || "Drone Video";
				newVideoData.uploadDate				= video.UploadDate;
				newVideoData.userId						= savedUser_p;
				newVideoData.videoPath				= video.FileName;
				newVideoData.viewCount				= video.ViewCount;
				
				
				//loggerUserUtils.debug(".MigrateVideo origVideoData: " + JSON.stringify(video, null, 2));
				//loggerUserUtils.debug(".MigrateVideo newVideoData: " + JSON.stringify(newVideoData, null, 2));

				if(newVideoData.thumbnailPath === null) {
					savedVideoCount++;
				}
				else {
					
					(function(newVideoData, oldVideoData) {

						videoCrud1_0_0
							.create(newVideoData)
							.then(function(savedVideo) {
								savedVideoCount++;
								logger.debug(".MigrateVideos: savedVideoCount:" + savedVideoCount + ", videoSize:" + videoSize);
								if(savedVideoCount === videoSize) {
									logger.debug(".MigrateVideos: all videos saved");
									logger.debug(".MigrateVideos: END");
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

			}
	
		})
	);	
	
}




var LoadAllUserData = function() {
	logger.debug(".LoadAllUserData: BEG");
	return(new Promise(function(resolve, reject) {
		
		Users_v1
			.find({})
			.exec()
			.then(function(users) {
				
				AppendChannels(users)
					.then(function(users_p) {
						
						logger.debug(".LoadAllUserData: Got data from AppendChannels");
						logger.debug(".LoadAllUserData: Got data from AppendChannels");
						
						AppendVideos(users_p)
							.then(function() {
								logger.debug(".LoadAllUserData: Got data from AppendVideos");
								logger.debug(".LoadAllUserData: END");
								resolve(users_p);
							})
							.catch(function(error) {
								logger.error(".LoadAllUserData: AppendVideos error:" + error);
								logger.debug(".LoadAllUserData: END");
								reject(error);
							});
					})
					.catch(function(error) {
						logger.error(".LoadAllUserData: AppendChannels error:" + error);
						logger.debug(".LoadAllUserData: END");
						reject(error);
					});
								
			})
			.catch(function(error) {
				logger.error(".LoadAllUserData: Users error:" + error);
				logger.debug(".LoadAllUserData: END");
				reject(error);
			})

		})
	);	
}



/*
 * MigrateData
 */
var MigrateData = function() {
	logger.debug(".MigrateData: BEG");
	logger.error(".MigrateData: FIX USER NAME");
	logger.error(".MigrateUser: FIX PASSWORD MIGRATION");
	
	CleanDestination()
		.then(function() {
			LoadAllUserData()
				.then(function(users_p) {
					var users_m = null;
					logger.debug(".MigrateData: users.length:" + users_p.length);
				
					users_m = MergeUsers(users_p);
					var userV1			= null;
					var userIndex		= 0;
					var userSize		= 50;//users_m.length;
					for(userIndex		= 0; userIndex < userSize; userIndex++) {
						userV1 = users_m[userIndex];
						
						if(userIndex < 5) {
							//logger.debug(".MigrateData: user:" + JSON.stringify(user, null, 2));							
						}
						
						userV1.user_name = userV1.user_name || null;
						if(userV1.user_name !== null) {
							userV1.user_name = userV1.user_name + userIndex;
						(function(userV1_p) {
							
							MigrateUser(userV1_p)
								.then(function(userV2) {
									MigrateVideos(userV2, userV1_p)
										.then(function() {
											
										})
										.catch(function(error) {
											
										});
								
								
								}).catch(function(error) {
									logger.error(".MigrateData: user:" + JSON.stringify(userV1_p, null, 2));
									logger.error(".MigrateData MigrateUser error:" + error);
								});
							
						})(userV1)				
						
						}
						
					}
					

				}).catch(function(error) {
					logger.error(".MigrateData LoadAllUserData error:" + error);
					logger.debug(".MigrateData: END");
				});
		})
		.catch(function(error) {
			logger.error(".MigrateData error:" + error);
			logger.debug(".MigrateData: END");
			reject(error);
		});
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
	
}

setTimeout(function() {
		//new MigrateUsers().execute();
		MigrateData();
	}, 100
);


