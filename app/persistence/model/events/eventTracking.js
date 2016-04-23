var mongoose = require('mongoose');

var eventTrackingSchema = mongoose.Schema({
	
	codeSource : {
		required	: false,
		type			: String
	},

	/*
	 * When created.
	 */
	createdDate : {
		default: Date.now,
		type: Date
	},
	
	eventName : {
		required	: false,
		type			: String
	},
	
	/*
	 * 'browser', 'nodejs', 'android', 'ios', etc
	 */
	eventSource : {
		required	: true,
		type			: String
	},	
	
	/*
	 * 'click', 'mousedown', 'mouseup', etc
	 * 'createVideo', 'createUser', 'login', etc
	 */
	eventType : {
		required	: true,
		type			: String
	},
	


	/*
	// "CLIENT" | "SERVER"
	// userId
	*/
	userId: {
	 	ref				: 'User',
	 	required	: false,
	 	type			: mongoose.Schema.ObjectId
	}
	
	
});

module.exports = {
	connectionName	: "events",
	modelName				: "EventTracking",
	schema					: eventTrackingSchema
}