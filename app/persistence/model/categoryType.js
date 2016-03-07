var mongoose = require('mongoose');

var categoryTypeSchema = mongoose.Schema({

	/*
	 * An optional background image for the category.
	 */
	backGroundImage : {
		required : false,
		type			: String
	},

	/*
	 * The model of the drone.
	 */
	name: {
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

module.exports = mongoose.model('CategoryType', categoryTypeSchema);
