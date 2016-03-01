"use strict";

var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.Users');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var UsersModel									= mongoose.model('users');

var User = function() {
	
}

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
User.prototype.getPreCondition = function(params) {
	/*
	 * @type {string}
	 */
	var sourceLocation	= params.sourceLocation;
	
	/*
	 * @type {Object}
	 */
	var preCondition		= new ObjectValidationUtil();
	
	preCondition.setValidation(function(params) {
		//need to pass in user data info
		var errorMessage				= new ErrorMessage();
		var sessionId					= params.sessionId || null;
		var userId						= params.user.userId || null;
		this.data.emailAddress			= params.user.emailAddress || null;
		this.data.password				= params.user.password || null;
		this.data.firstName				= params.user.firstName || null;
		this.data.lastName				= params.user.lastName || null;
		this.data.userName				= params.user.userName || null;
		
		if(userId === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode		: "400",,
				errorMessage 	: "User ID is null", 
				sourceLocation	: sourceLocation
			});
		}			
		
		if(sessionId === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode		: "400",
				errorMessage 	: "Session ID is null",
				sourceLocation	: sourceLocation
			});
		}

		if(emailAddress === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode		: "400",
				errorMessage 	: "Email address is null",
				sourceLocation	: sourceLocation
			});
		}

		if(password === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode		: "400",
				errorMessage 	: "Password is null",
				sourceLocation	: sourceLocation
			});
		}

		if(userName === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode		: "400",
				errorMessage 	: "Username is null",
				sourceLocation	: sourceLocation
			});
		}

		if(firstName === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode		: "400",
				errorMessage 	: "First name is null",
				sourceLocation	: sourceLocation
			});
		}

		if(lastName === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode		: "400",
				errorMessage 	: "Last name is null",
				sourceLocation	: sourceLocation
			});
		}
				
	});

	return(preCondition);
}


/*
 * Create a new User document.
 */
User.prototype.create = function(params) {
	
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Users.create"});

	return(new Promise(function(resolve, reject) {

			// Validation
			var validation = preCondition.validate(params);
			if(validation.errors !== null) {
				reject(validation.errors);
			}		

			// Persist
			var userModel = new VideoModel(validation.data);
			userModel.save(function(error, user) {
				if(error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorMessage 		: "Failed while creating new user"
						sourceError			: error,
						sourceLocation		: "persistence.crud.Users.create"
					});
					reject(errorMessage.getErrors());
				}
				else {
					resolve(user);
				}
			});
			
		});
			
	);
}