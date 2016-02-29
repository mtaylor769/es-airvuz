var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var crypto   = require('crypto');
var uuid     = require('node-uuid');

var userSchema = mongoose.Schema({
	
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
    
	// The users email address
	emailAddress : {
		required	: true,
		type		: String,
		unique		: true
	},
		
  //user for password generating
  emailConfirmed: {
    type: Boolean,
    default: false
  },
  
	// The users first name
  firstName : {
		required : true,
    type : String
  },
	
	// The user last login date
	lastLoginDate : {
    type: Date,
    default: Date.now		
	},
  
	// The users last name
	lastName : {
		required	: true,
		type			: String
	},
	
	password : {
		required	: false,
		type			: String,
		unique		: true
	},
	
	// Represents a list of social media account tied to this user account.
	socialMediaAccounts: [{ 
			type: mongoose.Schema.Types.ObjectId, ref: 'SocialMediaAccount' 
	}],
	
	// Represents a unique user name that is displayed for the user.
	userName : {
		required	: false,
		type			: String,
		unique		: true
	},
	
	/* 
	 * The site url name of the user. 
	 * Example: www.airvuz.com/<userUrlName> 
	 */
	userUrlName : {
		required	: true,
		type			: String
	},
	
	version : {
		default	: "2.0.0",
		type		: String
	}
	
	

});

//userSchema.createIndex( { emailAddress: 1 }, { background: true } );
//userSchema.createIndex( { "socialMediaAccount.accountId": 1 }, { background: true } );

mongoose.model('User', userSchema);