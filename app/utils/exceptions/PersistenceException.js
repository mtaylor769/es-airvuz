var PersistenceException = function(params) {
	this.errors = params.errors;
}

PersistenceException.prototype.getErrors = function() {
	return(this.errors);
}

module.exports = PersistenceException;