var mongoose = require('mongoose');


var camera_schema = mongoose.Schema({
	camera: {type:mongoose.Schema.ObjectId, ref:'Camera'},
	cameraName: {type:String}
});

module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "Camera",
	schema					: camera_schema
};