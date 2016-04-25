try {
	// import
	var log4js											= require('log4js');
	var logger											= log4js.getLogger('app.persistence.crud.events.eventTracking');	
	
	var database										= require('../../database/database');
	var LoginModel									= null;
	var Promise											= require('bluebird');


	EventTrackingModel = database.getModelByDotPath({	modelDotPath	: 'app.persistence.model.events.eventTracking' });
	
	if(global.NODE_ENV === "production") {
		logger.setLevel("INFO");	
	}	
	
	logger.debug("import complete");
}
catch(exception) {
	logger.error(" import error:" + exception);
}

var EventTracking = function() {
	logger.debug("constructor: in");
}

EventTracking.prototype.create = function(params) {
	
	return(new Promise(function(resolve, reject) {
		
			var eventTrackingModel = new EventTrackingModel(params);
			eventTrackingModel
				.save(function(error, video) {
					if(error) {
						logger.debug(".create save failed:" + error);
						reject(error);
					}
					else {
						resolve();
					}
				});		
		
		})
	);

}

	/*
	 * 'click', 'mousedown', 'mouseup', etc
	 * 'createVideo', 'createUser', 'login', etc
	 */

EventTracking.eventType = {};
EventTracking.eventType.click = "click";


module.exports = new EventTracking();