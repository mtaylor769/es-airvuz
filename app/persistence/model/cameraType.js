var mongoose = require('mongoose');

var cameraTypeSchema = mongoose.Schema({

	/*
	 * The manufacurer of the camera.
	 * @type {string}
	 */
	manufacturer: {
		required	: true,
		type			: String
	},
	
	/*
	 * The model of the camera
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

mongoose.model('CameraType', cameraTypeSchema);