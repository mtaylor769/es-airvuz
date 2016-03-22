var User = require('../test/mockObjects/adminUser');
var userCrud = require('../app/persistence/crud/users');

var mongoose = require('../mongoose');

function createAUser(User) {
  console.log(User);
  userCrud.create(User)
  .then(function(user) {
  })
}

createAUser(User);