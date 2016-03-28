var database										= require('../../database/database');
var LoginModel									= null;
var log4js											= require('log4js');
var logger											= log4js.getLogger('app.persistence.crud.events.login');
var Promise											= require('bluebird');

logger.debug(" modual loaded ...");
	
try {
	LoginModel = database.getModelByDotPath({
			modelDotPath	: "app.persistence.model.events.login"
		});
}
catch(exception) {
	logger.error(" error initializing model: Login");
}

var Login = function() {
	
	logger.debug(" inited");
	
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