var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  uuid = require('node-uuid');

var user_schema = mongoose.Schema({
  //user for password generating
  emailConfirmed: {
    type: Boolean,
    default: false
  },
  user_name: String,
  urlName: String,
  first_name: String,
  last_name: String,
  country: String,
  city: String,
  place: String,
  gender: String,
  personalInfo: String,
  drone: String,
  camera: String,
  comment: String,
  rating: String,
  statistics: String,
  fbUserName: String,
  TwitterUserName: String,
  instagramUsername: String,
  allowDonation: Boolean,
  donationUrl: String,
  allowHire: Boolean,
  Business: {
    type: String,
    default: 'No'
  },
  DOB: Date,
  joining_date: {
    type: Date,
    default: Date.now
  },
  user_type: {
    type: String,
    default: 'general'
  }, //general or admin
  account_type: String, //paid or free
  email: {
    type: String,
    required: true
  },
  password: String,
  validCode: String, //password to recover
  salt: {
    type: String,
    required: true,
    default: uuid.v1
  },
  loginCount: {
    type: Number,
    default: 0
  },
  facebook: {},
  facebook_access_token: String,
  facebook_refresh_token: String,
  google: {},
  google_access_token: String,
  google_refresh_token: String,
  profile_picture: String,
  cover_picture: String,
  loc: [],
  categoryFav: {
    type: Array,
    default: [
      'Agriculture',
      'Air-to-Air',
      'Automotive',
      'Business'
    ]
  },

  interest: [],
  subscription: [],

  /*------------ Notification ----------------- */
  notification: [{
    Ntype: String,
    user: String,
    id: String,
    date: {
      type: Date,
      default: Date.now
    },
    status: String
  }],

  /*---------------------BIlash ------------------ */
  twitter: {},
  twitter_access_token: String,
  twitter_access_token_secret: String,
  MyFavouriteVideos: [],
  WatchLater: [],
  WatchedVideo: []

});

var hash = function (passwd, salt) {

  return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
};

user_schema.methods.setPassword = function (passwordString) {

  this.password = hash(passwordString, this.salt);
};
user_schema.methods.isValidPassword = function (passwordString) {
  return this.password === hash(passwordString, this.salt);
};

module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "User",
	schema					: user_schema
};