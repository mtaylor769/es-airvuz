var mongoose = require('mongoose');

var eventTrackingSchema = mongoose.Schema({
	clientIp: {
		required: false,
		type: String
	},

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

	eventMessage : {
		required: false,
		type: String
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
	 * Video playback details
	 */
	eventVideoPlaybackDetails: mongoose.Schema.Types.Mixed,

	/*
	 * Referrer
	 */
	referrer: String,

	/*
	 * Video ID based off Referrer
	 */
	videoId: String,

	/*
	 * Image File Type
	 */
	imgFileType: String,


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

/**
 * Index
 */
// compound indexes for video report
eventTrackingSchema.index({videoId: 1, eventName: 1});
eventTrackingSchema.index({eventName: 1});

module.exports = {
	connectionName	: "events",
	modelName				: "EventTracking",
	schema					: eventTrackingSchema
};