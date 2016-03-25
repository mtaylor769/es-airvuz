var rootUser = require('../test/mockObjects/rootUser');
var userCrud = require('../app/persistence/crud/users');

var mongoose = require('../mongoose');

function createAUser(User) {
  console.log(user);
  userCrud.create(User)
  .then(function(user) {
  })
}

createAUser(rootUser);