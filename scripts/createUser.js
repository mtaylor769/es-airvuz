var User = require('../test/mockObjects/adminUser');
var userCrud = require('../app/persistence/crud/users');

var mongoose = require('../mongoose');

function createAUser(User) {
  console.log('hitting createAUser');
  console.log(User);
  userCrud.create(User)
  .then(function(user) {
    console.log('end user : ' + user);
  })
}

createAUser(User);