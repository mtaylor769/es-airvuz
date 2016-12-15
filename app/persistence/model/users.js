var mongoose 			= require('mongoose');
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
/*
* The users donation URL
* */
	donationUrl : {
		type: String
	},

	// The users email address
	emailAddress : {
		type			: String,
		lowercase	: true,
		required	: true,
		unique		: true
	},
  
	// The users first name
  firstName : {
    type : String
  },
	
	status : {
		type: String,
		default: 'email-confirm',
		enum: ['active', 'email-confirm', 'suspended']
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

	validCodeV1: {
		type: String,
		select: false
	},

	resetPasswordCode: String,

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
	userNameDisplay : {
		required	: true,
		unique		: true,
		type			: String
	},

	userNameUrl: String,
	
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

	/*
	 * flag for FB user name creation
	 */
	remindFBUserNameCreate: {
		type: Boolean,
		default: true
	},
	
	version : {
		default	: "2.0.0",
		type		: String
	},

	loc: {
		type: {
			type: String,
			default: "Point"
		},
		address: {
			type: String,
			default: ""
		},
		coordinates: {
			type: [Number],
			default: [-150, 0]
		},
		googlePlaceId: String
	}
});

usersSchema.index({'loc': '2dsphere'});

usersSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

function generateHash(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function purgeUserNameDisplay(userNameDisplay) {
	return userNameDisplay.replace(/[#!$=@;'+,<>:"%^&()\/\\|\?\*{}\.~`\[\]]/g, '').replace(/\s/g, '-');
}

usersSchema.statics.purgeUserNameDisplay 	= purgeUserNameDisplay;
usersSchema.statics.generateHash 					= generateHash;

//userSchema.createIndex( { emailAddress: 1 }, { background: true } );
//userSchema.createIndex( { "socialMediaAccount.accountId": 1 }, { background: true } );

module.exports = {
	connectionName	: "main",
	modelName				: "Users",
	schema					: usersSchema
};

