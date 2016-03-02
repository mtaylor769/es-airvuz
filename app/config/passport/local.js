"use strict";

let _ = require('lodash');
let LocalStrategy = require('passport-local').Strategy;

const PROVIDER_KEY = 'local';

module.exports = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function (email, password, done) {

});

module.exports.PROVIDER_KEY = PROVIDER_KEY;