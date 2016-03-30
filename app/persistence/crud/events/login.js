try {
	// import
	var log4js											= require('log4js');
	var logger											= log4js.getLogger('app.persistence.crud.events.login');	
	
	var database										= require('../../database/database');
	var LoginModel									= null;
	var Promise											= require('bluebird');


	LoginModel = database.getModelByDotPath({	modelDotPath	: "app.persistence.model.events.login" });
	
	if(global.NODE_ENV === "production") {
		logger.setLevel("INFO");	
	}	
	
	logger.debug("import complete");
}
catch(exception) {
	logger.error(" import error:" + exception);
}

var Login = function() {
	logger.debug("constructor: in");
}

Login.prototype.create = function(params) {
	var login = new LoginModel();
	login.save(function(error, video) {
		if(error) {
			logger.debug(".create save failed:" + error);
		}
	});
}

module.exports = new Login();