var mongoose = require('mongoose');

var loginSchema = mongoose.Schema({

	/*
	 * When created.
	 */
	createdDate : {
		default: Date.now,
		type: Date
	},

/*
	userId: {
	 	ref				: 'User',
	 	required	: true,
	 	type			: mongoose.Schema.ObjectId
	}
	*/
	
});

module.exports = {
	connectionName	: "events",
	modelName				: "Login",
	schema					: loginSchema
}