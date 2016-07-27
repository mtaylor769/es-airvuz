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
		type: mongoose.Schema.ObjectId, ref: 'Users'
	},	
	
	/*
	 * The userId of the person who is following someone else.
	 */
	userId : {
		required: true,
		type: mongoose.Schema.ObjectId, ref: 'Users'
	}

});

module.exports = {
	connectionName	: "main",
	modelName				: "Followers",
	schema					: FollowersSchema
};