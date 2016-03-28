var mongoose = require('mongoose');

var seoSchema = mongoose.Schema({

	metaDescription : {
		required	: false,
		type			: String
	},
	
	metaKeywords : {
		required	: false,
		type			: String
	},

	ogImage	: {
		required	: false,
		type			: String
	},
	
	ogTitle	: {
		required	: false,
		type			: String
	},
	
	ogType	: {
		required	: false,
		type			: String
	},	
	
	ogUrl	: {
		required	: false,
		type			: String
	},	
	
	/*
	 * The manufacurer of the camera.
	 * @type {string}
	 */
	pageType: {
		default		: ['category', 'home', 'player', 'user-profile'],
		required	: true,
		type			: String
	},	
	
	pageTitle : {
		required	: true,
		type			: String
	}
	
});


module.exports = {
	connectionName	: "main",
	modelName				: "SEO",
	schema					: seoSchema
}

//mongoose.model('SEO', seoSchema);