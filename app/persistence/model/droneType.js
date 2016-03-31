var mongoose = require('mongoose');

var droneTypeSchema = mongoose.Schema({

	/*
	 * The manufacurer of the drone.
	 * @type {string}
	 */
	manufacturer: {
		required	: true,
		type			: String
	},
	
	/*
	 * The model of the drone.
	 */
	model: {
		required	: true,
		type			: String
	},
	
	/*
	 * Identifies if the camera name is visible.
	 */
	isVisible: {
		required	: true,
		type			: Boolean
	}

});

module.exports = {
	connectionName	: "main",
	modelName				: "DroneType",
	schema					: droneTypeSchema
};