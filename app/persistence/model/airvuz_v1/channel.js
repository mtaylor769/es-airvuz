var mongoose = require('mongoose');

require( __dirname + '/users.js');

var channel_schema = mongoose.Schema({

	User:  {type: mongoose.Schema.ObjectId, ref: 'User'},
	ChannelName: {type: String},
	Subscriptions: [],
	CoverPicture: {type: 'String', default: '/images/banner1.jpg'},
	CustomizedURL: {type: String},
	Private: Boolean
	});

module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "Channel",
	schema					: channel_schema
};