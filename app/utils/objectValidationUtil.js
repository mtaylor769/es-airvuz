var log4js											= require('log4js');
var logger											= log4js.getLogger('app.utils.objectValidationUtil');


/*
 * Example:
 *		var preCondition = new ObjectValidationUtil();
 *		preCondition.setValidation(function(params) {
 *
 *			this.data.eventData = params.eventData || {};
 *			this.data.eventId		= params.eventId || null;
 *			this.data.sessionId	= params.sessionId || null;
 *			this.data.userId		= params.userId || null;
 *
 *			if(this.data.userId === null) {
 *				this.errors = errorMessages.getErrorMessage({
 *					errors					: this.errors,
 *					errorId					: "USERID1000",
 *					sourceLocation	: "EventLogger.addClientTrackEvent"
 *				});
 *			}
 *		});
 *
 *		var response = preCondition.validate(params);
 */
var ObjectValidationUtil = function() {
	/*
	 * @type {function}
	 */
	this.validation = null;
	
	/*
	 * @type {object}
	 */
	this.response		= {};
	
	/*
	 * @type {Array}
	 */
	this.errors			= [];
	
	/*
	 * @type {object}
	 */
	this.data				= {};
	
	/*
	 * Identifies if the validation is for an update.
	 * @type {boolean}
	 */
	this.update			= false;
}

ObjectValidationUtil.prototype.setValidation = function(func) {
	logger.debug(".setValidation");
	this.validation = func;
}

ObjectValidationUtil.prototype.validate = function(params) {
	params			= params || {};
	this.update	= params.update || false;
	this.validation(params);
	
	if(this.errors.length === 0) {
		this.errors = null;
	}
	
	this.response.errors	= this.errors;
	this.response.data		= this.data;
	return(this.response);
}

module.exports = ObjectValidationUtil;