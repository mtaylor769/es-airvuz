"use strict";

let TwitterStrategy = require('passport-twitter').Strategy;
let Identity = require('../../models/identity');
let debug = require('debug')('airvuz:passport:twitter');

const PROVIDER_KEY = 'twitter';

module.exports = new TwitterStrategy({
  clientID: process.env.TWITTER_CLIENT_ID || '',
  clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
  callbackURL: '/api/auth/twitter/callback',
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {

});

module.exports.PROVIDER_KEY = PROVIDER_KEY;