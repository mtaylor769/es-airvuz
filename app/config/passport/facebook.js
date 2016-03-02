"use strict";

let FacebookStrategy = require('passport-facebook').Strategy;
let Identity = require('../../models/identity');
let debug = require('debug')('airvuz:passport:facebook');

const PROVIDER_KEY = 'facebook';

module.exports = new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID || '868675893230044',
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '916d3bbd7e46d2ff4ae05d173aef4cd7',
  callbackURL: '/api/auth/facebook/callback',
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
	//Need to look into profile information and return userID
	var consoleInformation = {
		accessToken : accessToken,
		refreshToken : refreshToken,
		profile	: profile,
		done : done
	}
	//log this and find out what it is
	return consoleInformation;
});

module.exports.PROVIDER_KEY = PROVIDER_KEY;