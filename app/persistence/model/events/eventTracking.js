var mongoose = require('mongoose');

var eventTrackingSchema = mongoose.Schema({

	/*
	 * When created.
	 */
	createdDate : {
		default: Date.now,
		type: Date
	},
	
	

	/*
	// "CLIENT" | "SERVER"
	// userId
	*/
/*
	userId: {
	 	ref				: 'User',
	 	required	: true,
	 	type			: mongoose.Schema.ObjectId
	}
	*/
	
});

module.exports = {
	connectionName	: "events",
	modelName				: "EventTracking",
	schema					: eventTrackingSchema
}