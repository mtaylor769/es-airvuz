var BaseException = require('./BaseException');
var util					= require('util');

var PersistenceException = function() {
	BaseException.apply(this, arguments);
	this.exceptionType = "PersistenceException";
}

util.inherits(PersistenceException, BaseException);

module.exports = PersistenceException;