var mongoose = require('mongoose');

/*
 * 
 */
var FollowersSchema = mongoose.Schema({
	
	/*
	 * When the document was created.
	 */
	createdDate : {
		default: Date.now,
		type: Date
	},
	
	/*
	 * The userId of the person who is being followed.
	 */
	followingUserId : {
		required: true,
		type: mongoose.Schema.ObjectId, ref: 'User'
	},	
	
	/*
	 * The userId of the person who is following someone else.
	 */
	userId : {
		required: true,
		type: mongoose.Schema.ObjectId, ref: 'User'
	}

});

module.exports = {
	connectionName	: "main",
	modelName				: "FollowersSchema",
	schema					: FollowersSchema
};