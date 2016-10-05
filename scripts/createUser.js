var User = require('../test/mockObjects/adminUser');
var userCrud1_0_0 = require('../app/persistence/crud/users1-0-0');

var mongoose = require('../mongoose');

function createAUser(User) {
    console.log(User);
    userCrud1_0_0.create(User)
        .then(function (user) {
        })
}

createAUser(User);