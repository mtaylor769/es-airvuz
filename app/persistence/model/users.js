var mongoose 			= require('mongoose');
var Schema  			= mongoose.Schema;
var bcrypt        = require('bcrypt-nodejs');
var uuid     			= require('uuid');

var userSchema 		= mongoose.Schema({
	
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
		type		: String
	},
	
	password : {
		required	: false,
		type		: String
	},
	
	// Represents a list of social media account tied to this user account.
	socialMediaAccounts: [{ 
		type: mongoose.Schema.Types.ObjectId, ref: 'SocialMediaAccount' 
	}],
	
	/* 
	 * The site url name of the user. 
	 * Example: www.airvuz.com/<uniqueName> 
	 */
	uniqueName : {
		required	: true,
		unique		: true,
		type			: String
	},
	
	version : {
		default	: "2.0.0",
		type		: String
	}
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
}

//userSchema.createIndex( { emailAddress: 1 }, { background: true } );
//userSchema.createIndex( { "socialMediaAccount.accountId": 1 }, { background: true } );

module.exports = mongoose.model('users', userSchema);