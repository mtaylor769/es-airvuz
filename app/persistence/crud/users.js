"use strict";
try {
	var log4js											= require('log4js');
	var logger											= log4js.getLogger('app.persistence.crud.users');

	var Promise											= require('bluebird');
	
	var ErrorMessage								= require('../../utils/errorMessage');
	var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
	var socialCrud 									= require('../../persistence/crud/socialMediaAccount');
	var database										= require('../database/database');
	var currentUser									= null;
	var UserModel										= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.users" });
	var validation 									= {};
	var crypto 											= require('crypto');
	var regSpaceTest								= new RegExp("\\s");

} 
catch(exception) {
	logger.error(" import error:" + exception);
}

var users = function() {
	
};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
users.prototype.validateCreateUser = function(params) {
	/*
	 * @type {string}
	 */
	logger.debug('made it to validation');
	var sourceLocation				= "persistence.crud.Users.create";
	var userInfo 							= {};
	//need to pass in user data info
	var errorMessage										= new ErrorMessage();
	userInfo.data 											= {};
	userInfo.data.coverPicture					= params.coverPicture || "";
	userInfo.data.emailAddress					= params.emailAddress || null;
	userInfo.data.userNameDisplay							= params.userNameDisplay || null;
	userInfo.data.aclRoles 							= params.aclRoles || ['user-general'];
	userInfo.data.profilePicture				= params.profilePicture || "";
	
	if (params.social) {
		userInfo.data.status 								= 'active';
	} else {
		userInfo.data.password        		= params.password || null;
		userInfo.data.confirmPassword     = params.confirmPassword || null;
		userInfo.data.status 							= 'email-confirm';

		
		if(userInfo.data.password === null) {
			userInfo.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "password"
				},
				sourceError			: "#password",
				displayMsg			: "This field is required",
				errorMessage		: "Password is null",
				sourceLocation	: sourceLocation
			});
		}
		
		if(userInfo.data.confirmPassword === null) {
			userInfo.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "emailAddress"
				},
				sourceError			: "#confirm-password",
				displayMsg			: "This field is required",
				errorMessage		: "Confirm Password is null",
				sourceLocation	: sourceLocation
			});
		}
		
		if(userInfo.data.password !== null && userInfo.data.confirmPassword !== null && userInfo.data.password !== userInfo.data.confirmPassword) {
			userInfo.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "emailAddress"
				},
				sourceError			: "#password",
				displayMsg			: "Passwords dont match",
				errorMessage		: "Passwords dont match",
				sourceLocation	: sourceLocation
			});
		}
	}

	if(userInfo.data.emailAddress === null) {
		userInfo.errors = errorMessage.getErrorMessage({
			statusCode			: "400",
			errorId					: "VALIDA1000",
			templateParams	: {
				name : "emailAddress"
			},
			sourceError			: "#email",
			displayMsg			: "This field is required",
			errorMessage		: "Email address is null",
			sourceLocation	: sourceLocation
		});
	}

	if(userInfo.data.userNameDisplay === null) {
		userInfo.errors = errorMessage.getErrorMessage({
			statusCode			: "400",
			errorId					: "VALIDA1000",
			templateParams	: {
				name : "userNameDisplay"
			},
			sourceError			: "#userNameDisplay",
			displayMsg			: "This field is required",
			errorMessage		: "userNameDisplay is null",
			sourceLocation	: sourceLocation
		});
	}
logger.error('line 125');
	return UserModel.findOne({emailAddress: userInfo.data.emailAddress}).exec()
			.then(function(email) {
				if (email) {
					socialCrud.findByUserId(email._id)
						.then(function(social) {
							if(social) {
								userInfo.errors = errorMessage.getErrorMessage({
									statusCode: "400",
									errorId: "VALIDA1000",
									templateParams: {
										name: "emailAddress"
									},
									sourceError: "#email",
									displayMsg: "Email already exists. Please reset password.",
									errorMessage: "Email already exists",
									sourceLocation: sourceLocation
								});
							} else {
								userInfo.errors = errorMessage.getErrorMessage({
									statusCode: "400",
									errorId: "VALIDA1000",
									templateParams: {
										name: "emailAddress"
									},
									sourceError: "#email",
									displayMsg: "Email already exists",
									errorMessage: "Email already exists",
									sourceLocation: sourceLocation
								});
							}
						})	
				} else {
					email = userInfo.data.emailAddress;
					logger.error('line 158');
					logger.error(userInfo.data.emailAddress);
					var regex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/g;
					var checkEmail = email.match(regex);
					logger.error(checkEmail);
					if(!checkEmail) {
						logger.error('error');
						userInfo.errors = errorMessage.getErrorMessage({
							statusCode: "400",
							errorId: "VALIDA1000",
							templateParams: {
								name: "emailAddress"
							},
							sourceError: "#email",
							displayMsg: "Please enter a vaild email address",
							errorMessage: "Invalid Email",
							sourceLocation: sourceLocation
						});
					}
				}
				return UserModel.findOne({userNameDisplay: userInfo.data.userNameDisplay}).exec()
			})
			.then(function (userNameDisplay) {
				if (userNameDisplay) {
					userInfo.errors = errorMessage.getErrorMessage({
						statusCode: "400",
						errorId: "VALIDA1000",
						templateParams: {
							name: "userName"
						},
						sourceError: '#username',
						displayMsg: "Username already exists",
						errorMessage: "Username already exists",
						sourceLocation: sourceLocation
					});
				}
				// replace illegal characters
				userInfo.data.userNameUrl = userInfo.data.userNameDisplay.replace(/[\s#!$=@;'+,<>:"%^&()\/\\|\?\*]/g, '');
				return userInfo;
			});
	
};


var ValidateUserName = function(id, params) {
	var sourceLocation				= "persistence.crud.Users.update";
	var errorMessage					= new ErrorMessage();

	return(new Promise(function(resolve, reject) {
			if (params.userNameDisplay) {
				UserModel.findOne({userNameDisplay : params.userNameDisplay})
					.lean()
					.exec()
						.then(function(user){
						if(user){
							if (user._id !== id) {
								var errors = errorMessage.getErrorMessage({
									statusCode			: "400",
									errorId					: "VALIDA1000",
									templateParams	: {
										name : "userNameDisplay"
									},
									sourceError			: '#username',
									displayMsg			: "Username already exists",
									errorMessage		: "Username already exists",
									sourceLocation	: sourceLocation
								});
								reject(errors);
								return;
							} else {
								resolve();
								return;
							}
						} else {
							resolve();
							return;
						}
					})
					.catch(function(error) {
						logger.error('line 241');
						logger.debug(error);
						reject(error);
						return;
					});
			} else {
				resolve();
				return;
			}
		})
	);
};

var ValidateEmailAddress = function(id, params) {
	var sourceLocation				= "persistence.crud.Users.update";
	var errorMessage					= new ErrorMessage();

	return(new Promise(function(resolve, reject) {
		if (params.emailAddress) {
			UserModel.findOne({emailAddress : params.emailAddress})
			.then(function(user){
				if (user._doc._id !== id) {
					var errors = errorMessage.getErrorMessage({
						statusCode			: "400",
						errorId					: "VALIDA1000",
						templateParams	: {
							name : "emailAddress"
						},
						sourceError			: "#email",
						displayMsg			: "Email already exists",
						errorMessage		: "Email already exists",
						sourceLocation	: sourceLocation
					});
					reject(errors);
					return;
				}
				resolve();
				return;
			})
			.catch(function(error) {
				reject(error);
				return;
			});
		} else {
			resolve();
			return;
		}
		}));
};

var ValidatePassword = function(id, params) {
	var sourceLocation				= "persistence.crud.Users.update";
	var errorMessage					= new ErrorMessage();
	
	return(new Promise(function(resolve, reject) {
		if (params.oldPassword) {
			if (params.newPassword !== params.confirmPassword) {
				var errors = errorMessage.getErrorMessage({
					statusCode			: "400",
					errorId					: "VALIDA1000",
					templateParams	: {
						name : "password"
					},
					sourceError			: "Passwords do not match",
					errorMessage		: "Passwords do not match",
					sourceLocation	: sourceLocation
				});
				reject(errors);
				return;
			} else {
				UserModel.findById(id).exec()
				.then(function (user) {
					if(!user.validPassword(params.oldPassword)) {
						var errors = errorMessage.getErrorMessage({
							statusCode			: "400",
							errorId					: "VALIDA1000",
							templateParams	: {
								name : "password"
							},
							sourceError			: "Password Invalid",
							errorMessage		: "Invalid Password",
							sourceLocation	: sourceLocation
						});
						reject(errors);
						return;
					} else {
						resolve();
						return;
					}
				})
				.catch(function(error){
					reject(error);
				});
			}
		} else {
			resolve();
			return;
		}
		}));
};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
users.prototype.validateUpdateUser = function(id, params) {
	var sourceLocation				= "persistence.crud.Users.update";
	var errorMessage					= new ErrorMessage();
	var userInfo 							= {};

	return(new Promise(function(resolve, reject) {
		
		ValidateUserName(id, params)
		.then(function(validation) {
			userInfo.errors = validation;
			
			ValidateEmailAddress(id, params)
			.then(function(validation){
				userInfo.errors = validation;
				
				ValidatePassword(id, params)
				.then(function(validation){
					userInfo.errors = validation;
					resolve(userInfo);
					return;
				})
				.catch(function(error){
					reject(error);
					return;
				});
			})
			.catch(function(error){
				reject(error);
				return;
			});
		})
		.catch(function(error){
			reject(error);
			return;
		});
	}));
};

/*
 * Create a new Users document.
 */
users.prototype.create = function(params) {
	logger.debug('made it into user create');
	validation 				= this.validateCreateUser(params);
	return validation.then(function (userInfo) {
		if(userInfo.errors) {
			throw userInfo.errors;
		} else {
			// Persist
			var saveUser = new UserModel(userInfo.data);
			if (params.social) {
				saveUser.userNameDisplay = saveUser._id;
			}
			if (saveUser.password) {
				logger.debug('hash password');
				saveUser.password = saveUser.generateHash(saveUser.password);
			}
			return saveUser.save(function (error) {
				if (error) {
					logger.debug('error while saving ' + error);
					var errorMessage = new ErrorMessage();
					throw errorMessage.getErrorMessage({
						statusCode: "500",
						errorId: "PERS1000",
						errorMessage: "Failed while creating new user",
						sourceError: error,
						sourceLocation: "persistence.crud.Users.create"
					});
				}
			});
		}
	});
};

/*
* Get all users
*/
users.prototype.getAllUsers = function() {
	return(new Promise(function(resolve, reject){
		UserModel.find({}).exec()
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
	}));
};

/*
* Get a user by ID
*/
users.prototype.getUserById = function (userId) {
	logger.debug('searching for user by userId: ' + userId);
	if (userId) {
		validation.userId 			= userId;
	} else {
		validation.userId 			= null;
		var errorMessage		= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while getting user by Id",
			sourceError								: "Invalid UserId",
			sourceLocation						: "persistence.crud.Users.getUserById"
		});
		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject){
		if (validation.userId === null) {
			reject(validation.errors);
		} else {
			UserModel.findOne({_id : validation.userId})
				.select('aclRoles emailAddress userNameDisplay userNameUrl lastName firstName profilePicture autoPlay')
				.lean()
				.then(function (user) {
					if(user.profilePicture.indexOf('http') > -1){
						user.externalLink = true;
					} else if(user.profilePicture === '') {
						return socialCrud.findByUserIdAndProvider(user._id, 'facebook')
							.then(function (social) {
								if(social) {
									user.externalLink = true;
									user.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=large';
								}
								return user;
							});
					}
					return user;
				})
				.then(function(user) {
					resolve(user)
				})
				.catch(function (error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorId 				: "PERS1000",
						errorMessage 		: "Failed while getting user by Id",
					  sourceError			:  error,
						sourceLocation	: "persistence.crud.Users.getAllAusers"
					});
					reject(errorMessage.getErrors());
				})
		}
	}));
};

/*
* Get a user by social media ID
*/
users.prototype.getUserBySocialId = function (socialId) {
	logger.debug('searching for user by socialId: ' + socialId);

	if (socialId) {
		validation.socialId 			= socialId;
	} else {
		validation.socialId 			= null;

		var errorMessage					= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while getting user by Id",
			sourceError								: "Invalid socialId",
			sourceLocation						: "persistence.crud.Users.getUserBySocialId"
		});
		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject){
		if (validation.errors) {
			logger.debug('validation errors exist');
			reject(validation.errors);
		} else {
			UserModel.find({socialMediaAccounts : validation.socialId}, 
			function(error, user){
				if (error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorId 				: "PERS1000",
						errorMessage 		: "Failed while getting user by social Id",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Users.getUserBySocialId"
					});
					reject(errorMessage.getErrors());
				} else {
					logger.debug('here is your user');
					logger.debug(user);
					resolve(user);
				}
			});
		}

	}));
};

/*
* Get a user by email
*/
users.prototype.getUserByEmail = function (email) {
	logger.debug('getUserByEmail: '+ email);
	if (email) {
		logger.debug(email);
		validation.emailAddress 	= email.toLowerCase();
	} else {
		validation.emailAddress		= null;
		var errorMessage						= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while getting user by Email",
			sourceError								: "Invalid UserEmail",
			sourceLocation						: "persistence.crud.Users.getUserByEmail"
		});

		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject) {
		if (validation.errors) {
			logger.debug(validation.errors);
			reject(validation.errors);
		} else {
			logger.debug('searching user model for address');
			logger.debug(validation.emailAddress);
			UserModel.findOne({emailAddress : validation.emailAddress}, function(error, user){
				if (error) {
					logger.debug('error when trying to find user by email');
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorId 				: "PERS1000",
						errorMessage 		: "Failed while getting user by Email",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Users.getUserByEmail"
					});
					logger.debug(error);
					reject(errorMessage.getErrors());
				} else {
					logger.debug('found user by email');
					logger.debug(user);
					resolve(user);
				}
			});
		}
	}));
	
};


/*
* Get a user by user name
*/
users.prototype.getUserByUserNameUrl = function (userNameUrl) {
	logger.debug('hitting getUserByUserNameDisplay');
	logger.debug(userNameUrl);
	if (userNameUrl) {
		validation.userNameUrl 	= userNameUrl;
	} else {
		validation.userNameUrl		= null;
		var errorMessage						= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while getting user by userNameUrl",
			sourceError								: "Invalid userNameUrl",
			sourceLocation						: "persistence.crud.Users.getUserByuserNameUrl"
		});

		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject){
		if (validation.userNameUrl === null) {
			reject(validation.errors);
		} else {
			logger.debug('line 566 : ' + validation.userNameUrl);
			UserModel.findOne({userNameUrl : validation.userNameUrl})
				.select('-password')
				.lean()
				.exec()
				.then(function(user) {
					resolve(user);
				})
				.catch(function() {
						var errorMessage		= new ErrorMessage();
						errorMessage.getErrorMessage({
							statusCode			: "500",
							errorMessage		: "Failed while getting user by user name",
							sourceError			: error,
							sourceLocation	: "persistence.crud.Users.getUserByuserNameDisplay"
						});
						reject(errorMessage.getErrors());
				})
		}
	}));
};

/*
* Update user information
*/
users.prototype.update = function (id, params) {
	var currentTransaction = this;
	return(new Promise(function(resolve, reject){

		var validate = currentTransaction.validateUpdateUser(id, params);
		validate.then(function(validation) {
			if(validation.errors) {
				reject(validation.errors);
				return;
			} else {
				if (params.userNameDisplay) {
					// update the userNameUrl also
					params.userNameUrl = params.userNameDisplay.replace(/[\s#!$=@;'+,<>:"%^&()\/\\|\?\*]/g, '');
				}
				if (params.oldPassword) {
					var hashUser 			= new UserModel();
					var pw 						= hashUser.generateHash(params.newPassword);
					delete params.oldPassword;
					delete params.newPassword;
					delete params.confirmPassword;
					params.password 	= pw;
				}
				UserModel.findByIdAndUpdate(id, params, {new: true}).populate('SocialMediaLinks').exec()
				.then(function(user) {
					if (user._doc.password) {
						user._doc.password = null;
					}
					resolve(user);
					return;
				});
			}
		})
		.catch(function(error){
			reject(error);
			return;
		});
	}));
};

/*
* Delete
*/
users.prototype.delete = function(userId) {
	if (userId) {
		validation.userId 					= userId;
	} else {
		validation.userId						= null;
		var errorMessage						= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while deleting user by Id",
			sourceError								: "Invalid Id",
			sourceLocation						: "persistence.crud.Users.delete"
		});

		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject){
		if (validation.userId === null) {
			reject(validation.errors);
		} else {
			UserModel.delete({_id : validation.userId}, function(error, user){
				if (error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorMessage 		: "Failed while deleting user by Id",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Users.delete"
					});
					reject(errorMessage.getErrors());
				} else {
					resolve(user);
				}
			});
		}
	}));
};

users.prototype.emailConfirm = function(userId) {
	return(new Promise(function(resolve, reject) {
		UserModel.findOne({_id: userId})
			.then(function(user) {
				if(user.status === 'email-confirm') {
					user.status = 'active';
					user.save(function(user) {
						resolve('true');
					})
				} else {
					resolve('false');
				}
			})
			.catch(function(error) {
				if(!userId){
					resolve()	
				} else if(userId) {
					resolve('false');
				}
			})
	})
	)
};

function updateRoles(params) {
	// TODO: implement
}

function resetPasswordRequest(email) {
	return UserModel.findOne({emailAddress: email}).exec()
		.then(function (user) {
			if (!user) {
				throw 'Email does not exists';
			}
			// random string in hex to prevent adding "/" "+"
			var resetCode = crypto.randomBytes(10).toString('hex');
			// send email to reset
			user.resetPasswordCode = resetCode;

			return user.save();
		});
}

function resetPasswordChange(code, newPassword) {
	return UserModel.findOne({resetPasswordCode: code}).exec()
		.then(function (user) {
			if (!user) {
				throw 'No code reset exists';
			}
			user.password = user.generateHash(newPassword);

			user.resetPasswordCode = undefined;
			return user.save();
		});
}

users.prototype.updateRoles 					= updateRoles;
users.prototype.resetPasswordRequest 	= resetPasswordRequest;
users.prototype.resetPasswordChange 	= resetPasswordChange;

module.exports = new users();
