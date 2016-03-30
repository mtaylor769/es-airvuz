var usersCrud              = require('../../persistence/crud/users');

function User() {

}

function post(req, res) {
  usersCrud
    .create(req.params)
    .then(function (user) {
      res.send(user);
    });
}

function search(req, res) {
  if (req.query.username) {
    return usersCrud
      .getUserByUserName(req.query.username)
      .then(function (user) {
        res.json(user);
      });
  }
  res.sendStatus(400);
}

User.prototype.post = post;
User.prototype.search = search;

module.exports = new User();
