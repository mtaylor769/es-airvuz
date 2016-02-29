var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var socialMediaAccountSchema = mongoose.Schema({

	/*
	 * @type {string}
	 */
	accountType : {
		required	: true,
		type			: String,
		default		: ['FACEBOOK', "GOOGLE+", "INSTAGRAM", "TWITTER", "VIMEO"]
	},
	
	accountData : {},

	/*
	 * Represents the id from the social media account.
	 * @type {string}
	 */
	accountId   : {
		required	: true,
		type			: String
	}

});

mongoose.model('SocialMediaAccount', socialMediaAccountSchema);

