var BaseException = function(params) {
	params							= params || {};
	this.errors					= params.errors || {};
	this.exceptionType	= "";
}

BaseException.prototype.getErrors = function() {
	return(this.errors);
}

BaseException.prototype.getResponse = function() {
	logger.debug("getResponse");
	var response									= {};
	response.error								= {};
	response.error.exceptionType	= this.exceptionType;
	response.error.errors					= this.errors;
	return(response);
}

module.exports = BaseException;