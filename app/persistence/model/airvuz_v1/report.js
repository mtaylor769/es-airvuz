var mongoose = require('mongoose');

require( __dirname + '/report.js');

var report_schema = mongoose.Schema({

	User:  {type: mongoose.Schema.ObjectId },
	VideoId: {type: String},
	reporter:{type:String},
	reporterUserName: {type:String},
	message:{type:String},
	reporting_date: {type: Date, default: Date.now},
	
	Thumbnail: String
	
	});



module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "Report",
	schema					: report_schema
};