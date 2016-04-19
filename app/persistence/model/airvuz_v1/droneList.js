var mongoose = require('mongoose');

//require( __dirname + '/users.js');

var drone_schema = mongoose.Schema({

	drone:  {type: mongoose.Schema.ObjectId, ref: 'Drone'},
	droneName: {type: String}

});

module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "Drone",
	schema					: drone_schema
};