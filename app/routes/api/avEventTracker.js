var EventTrackingCrud = require('../../persistence/crud/events/eventTracking');

var namespace				= 'app.routes.api.avEventTracker';
var log4js					= require('log4js');
var logger					= log4js.getLogger(namespace);

if(global.NODE_ENV === "production") {
	logger.setLevel("WARN");	
}

function AVEventTracker() {

}

AVEventTracker.prototype.put = function(req, res) {
	var params = {};
	params.codeSource		= req.body.codeSource;
	params.eventName		= req.body.eventName;
	params.eventSource	= req.body.eventSource;
	params.eventType		= req.body.eventType;	
			
	EventTrackingCrud
		.create(params)
		.then(function() {
			logger.debug(".post created");
		})
		.catch(function(error) {
			logger.error(".post error:" + error);
		});
	
	res.send("");
	
};

module.exports = new AVEventTracker();