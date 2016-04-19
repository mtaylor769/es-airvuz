var mongoose = require('mongoose');

//require( __dirname + '/users.js');

var notification_schema = mongoose.Schema({

	
	favourited: [{
		user: String,
		video_id: String,
		date: {type: Date, default: Date.now},
		status: String,
	}],

	follower: [{
		user: String,
		channel_id : String,
		date: {type: Date, default: Date.now},
		status: String,
	}],

	comment: [{
		user: String,
		video_id: String,
		date: {type: Date, default: Date.now},
		status:String,

	}]



});

module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "Notification",
	schema					: notification_schema
};