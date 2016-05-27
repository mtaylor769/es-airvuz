var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var socialMediaAccountSchema = mongoose.Schema({


	
	accountData : {},

	/*
	 * Represents the id from the social media account.
	 * @type {string}
	 */
	accountId   : {
		required	: true,
		type			: String
	},
	
	/*
	 * @type {string}
	 */
	provider : {
		required	: true,
		type			: String,
		enum			: ['facebook', "google", "INSTAGRAM", "TWITTER", "VIMEO"]
	},
	
	userId: { 
		type: mongoose.Schema.Types.ObjectId, ref: 'Users' 
	}

});

//module.exports = mongoose.model('SocialMediaAccount', socialMediaAccountSchema);

module.exports = {
  connectionName  : "main",
  modelName       : "SocialMediaAccount",
  schema          : socialMediaAccountSchema
};