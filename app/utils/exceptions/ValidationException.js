var ValidationException = function(params) {
	this.errors = params.errors;
}

ValidationException.prototype.getErrors = function() {
	return(this.errors);
}

module.exports = ValidationException;