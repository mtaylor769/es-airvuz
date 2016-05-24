var mongoose 			= require('mongoose');
var Schema  			= mongoose.Schema;
var bcrypt        = require('bcrypt-nodejs');
var uuid     			= require('uuid');

var usersSchema 		= mongoose.Schema({
	
	/*
	 * User ACL Roles.
	 */
	aclRoles : [String],
	
	// Does the user accept donations.
	allowDonation : {
		type		: Boolean,
		default : false
	},
	
	// Is the user available for hire.
	allowHire : {
		type		: Boolean,
		default	: false
	},
	
	// The data the user account was created
	accountCreatedDate : {
    type: Date,
    default: Date.now
	},
	
	/*
	 * Indicates if the next video is to be played automatically.
	 */
	autoPlay : {
		default : true,
		type		: Boolean
	},
    
	/*
	 * The site url name of the user. 
	 * Example: www.airvuz.com/<uniqueName> 
	 */
	customizedUrl : {
		type	: String
	},
		
	/*
	 * The users cover picture.
	 */
	coverPicture : {
		type: String
	},		
		
	// The users email address
	emailAddress : {
		required	: false,
		type		: String/*,
		unique		: true*/
	},
		
  //user for password generating
  emailConfirmed: {
    type: Boolean,
    default: false
  },
  
	// The users first name
  firstName : {
    type : String
  },
	
	isSuspended : {
		default		: false,
		required	: true,
		type			: Boolean
	},
	isSubscribeAirVuzNews: {
		default		: false,
		type			: Boolean
	},
	
	// The user last login date
	lastLoginDate : {
    type: Date,
    default: Date.now		
	},
  
	// The users last name
	lastName : {
		type		: String
	},
	
	password : {
		type		: String
	},

	profilePicture : {
		type: String
	},
	
	/*
	// Represents a list of social media account tied to this user account.
	socialMediaAccounts: [{ 
		type: mongoose.Schema.Types.ObjectId, ref: 'SocialMediaAccount' 
	}],
	*/
 
	/* 
	 *
	 */
	userName : {
		required	: true,
		unique		: true,
		type			: String
	},
	
	aboutMe : {
		type 			: String
	},
	
	socialMediaLinks : [
		{
			socialType : {
				required	: true,
				type			: String,
				enum			: ['FACEBOOK', "GOOGLE+", "INSTAGRAM", "TWITTER", "VIMEO"]
			},
			url : {
				type : String
			}
		}
	],
	
	version : {
		default	: "2.0.0",
		type		: String
	}
});

usersSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

usersSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

//userSchema.createIndex( { emailAddress: 1 }, { background: true } );
//userSchema.createIndex( { "socialMediaAccount.accountId": 1 }, { background: true } );

module.exports = {
	connectionName	: "main",
	modelName				: "Users",
	schema					: usersSchema
};

