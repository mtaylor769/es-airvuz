var usersCrud              = require('../../persistence/crud/users');
var jwt                 = require('jsonwebtoken');
var tokenConfig         = require('../../../config/token');

function User() {

}

User.prototype.post = function(req, res) {
  usersCrud
  .create(req.params)
  .then(function(user) {
    res.send(user);
  })
};
