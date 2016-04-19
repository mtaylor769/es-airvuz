var mongoose = require('mongoose');

require( __dirname + '/channel.js');

var video_schema = mongoose.Schema({

	Channel:  {type: mongoose.Schema.ObjectId, ref: 'Channel'},
	User: {type: mongoose.Schema.ObjectId, ref: 'User'},
	FileName: String,
	Thumbnail: String,
	Duration: String,
	Title: String,
	UploadDate: {type: Date, default: Date.now},
	RecordDate: {type: Date, default: Date.now},
	ViewCount: {type: Number, default: 0},
	speed: {type: Number, default: 1},
	rating: {type: Number, default: 0},
	ratingCounter: {type: Number, default: 0},
	ViewedBy: [],
	LikedBy:[],
	Like: {type: Number, default: 0},
	VideoLocation: [],//{"type":  [Number], index: '2dsphere'},
	formatted_address: String,
	CameraType: String,
	DroneType: String,
	Tags: [],
	Description: String,
	Categories: [],
	AllowComments: {type: Boolean, default: true},
	AllowRatings: {type: Boolean, default: true},
	Statistics: {type: Boolean, default: true},
	favourited: [],
	Comments:[{
		comment:String,
		comentatorId:String,
		comentatorPic:String,
		comentatorName:String,
		Time: {type: Date, default: Date.now}
	}]
	
	});


module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "Videos",
	schema					: video_schema
};