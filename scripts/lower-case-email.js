#!/usr/bin/env node
/**
 * Run at the root /AirVuz2
 * - sudo node scripts/lower-case-email.js
 *
 */
console.log('******************** lower case email script ********************');

var mongoose = require('mongoose'),
  Promise = require('bluebird'),
  User;

/**
 * Config
 */
var DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
var databaseOptions = {
  user: process.env.DATABASE_USER || '',
  pass: process.env.DATABASE_PASSWORD || '',
  auth: {
    authdb: 'admin'
  }
};

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://' + DATABASE_HOST + '/AirVuz2', databaseOptions);

User = mongoose.model('User', require('../app/persistence/model/users.js').schema);

function closeDatabaseConnection() {
  mongoose.connection.close();
  console.log('******************** close database connection ********************');
}

function getUser() {
  return User.find({}).exec();
}

function changeEmailToLowerCase(users) {
  return Promise.map(users, function (user) {
    user.emailAddress = user.emailAddress.toLowerCase();
    return user.save();
  });
}

mongoose.connection.once('connected', function () {
  getUser()
    .then(changeEmailToLowerCase)
    .catch(function (err) {
      console.log('******************** err ********************');
      console.log(err);
      console.log('************************************************');
    })
    .finally(closeDatabaseConnection);
});

