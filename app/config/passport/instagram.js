"use strict";

let InstagramStrategy = require('passport-instagram').Strategy;
let Identity = require('../../models/identity');
let debug = require('debug')('airvuz:passport:instagram');

const PROVIDER_KEY = 'instagram';

module.exports = new InstagramStrategy({
  clientID: process.env.INSTAGRAM_CLIENT_ID || '',
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
  callbackURL: '/api/auth/instagram/callback',
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {

});

module.exports.PROVIDER_KEY = PROVIDER_KEY;