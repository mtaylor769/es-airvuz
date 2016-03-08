var BaseException = function(params) {
	this.errors					= params.errors;
	this.exceptionType	= "";
}

BaseException.prototype.getErrors = function() {
	return(this.errors);
}

BaseException.prototype.getResponse = function() {
	var response									= {};
	response.error								= {};
	response.error.exceptionType	= this.exceptionType;
	response.error.errors					= this.errors;
	return(response);
}

module.exports = BaseException;