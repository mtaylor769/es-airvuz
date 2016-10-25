var mongoose = require('mongoose');
var Promise = require('bluebird');
var User = null;

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

User = mongoose.model('Users', require('../app/persistence/model/users.js').schema);


function closeDatabaseConnection() {
  mongoose.connection.close();
  console.log('******************** close database connection ********************');
}

function getUsers() {
  return User.find({}).exec();
}

function removeSpecialCharacters(users) {
  return Promise.map(users, function(user) {
    if(user.userNameUrl) {
        user.userNameUrl = User.purgeUserNameDisplay(user.userNameUrl);
        return user.save();
    }
    return user;
  });
}


mongoose.connection.once('connected', function() {
  getUsers()
    .then(removeSpecialCharacters)
    .catch(function(error) {
      console.log(error);
    })
    .finally(closeDatabaseConnection);
});