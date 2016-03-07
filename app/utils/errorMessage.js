var log4js					= require('log4js');
var logger					= log4js.getLogger("util.errorMessage");
var formatString		= require("string-template");

var ERRORS = {
		
		PARAM1010 : {
			msg : "Missing param: {name}"
		},
		
		PARAM1020 : {
			msg : "Param invalid type. Expected {type}"
		},
		
		PERS1000 : {
			msg : "MongoDB save error."
		},

		SESSIONID1000 : {
			msg : "sessionId is missing."
		},
		
		SESSIONID1010 : {
			msg : "sessionId is invalid."
		},
		
		USERID1000 : {
			msg : "userId is missing."
		},
		
		USERID1010 : {
			msg : "userId is invalid."
		},
		
		VALIDA1000 : {
			msg : "Required: {name}"
		},
		
		VALIDA1010 : {
			msg : "Requires valid email format: {name}"
		}
	}

var ErrorMessage = function() {
	this.errors = [];
}

/*
 * Retuns null if no errors, otherwise returns an array of error objects.
 * @returns {Array}
 */
ErrorMessage.prototype.getErrors = function() {
	return(this.errors);
}

/*
 * @param {Object}		params
 * @param {string}		params.errorId - the current error to lookup
 * @param {string}		params.sourceLocation - the name space to the function that is causing the error, ex: Users.create.
 * @param {string}		params.sourceError - an source error, such as a failed save to mongo.
 * @param {Object}		params.templateParams - params use to populate an error message.
 */
ErrorMessage.prototype.getErrorMessage = function(params) {
	var error							= {};	
	
	if(params === null) {
		// Missing params
		error.errorId					= "PARAM1010";
		error.sourceError			= "";
		error.sourceLocation	= "";			
		error.errorMsg				= ERRORS[error.errorId].msg;
		this.errors.push(error);
		return(this.errors);
	}
	
	params							= params || {};
	var errorId					= params.errorId || null;
	var templateParams	= params.templateParams || null;
	
	
	error.errorId					= errorId;
	error.sourceError			= params.sourceError;
	error.sourceLocation	= params.sourceLocation || "";	
	error.errorMsg				= ERRORS[errorId].msg;
	
	// If the error msg has template values, apply them.
	if(templateParams !== null) {
		error.errorMsg = formatString(error.errorMsg, templateParams);
	}

	switch(error.errorId) {
		case "PARAM1010" : {
				error.paramName = templateParams.name;
		}
	}
	
	this.errors.push(error);
	return(this.errors);
}

module.exports = ErrorMessage;