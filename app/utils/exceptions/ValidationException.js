var BaseException = require('./BaseException');
var util					= require('util');

var ValidationException = function() {
	BaseException.apply(this, arguments);
	this.exceptionType = "ValidationException";
}

util.inherits(ValidationException, BaseException);

module.exports = ValidationException;