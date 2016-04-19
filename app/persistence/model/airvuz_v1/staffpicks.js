var mongoose = require('mongoose');

var staffpicks_schema = mongoose.Schema({
	staffpicksList: {type: mongoose.Schema.ObjectId, ref: 'StaffpicksList'},
	staffpicksListId: {type: String}


});

module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "StaffpicksList",
	schema					: staffpicks_schema
};