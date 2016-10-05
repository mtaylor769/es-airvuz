var acl = require('../../utils/acl'),
  UserCrud = require('../../persistence/crud/users1-0-0');

function Acl() {
}

Acl.prototype.put = function(req, res) {
  acl.isAllowed(req.user._id, 'acl', 'edit')
    .then(function (isAllow) {
      if (!isAllow) {
        res.sendStatus(400);
      }
      return UserCrud
        .updateRoles(req.body)
        .then(function () {
          res.sendStatus(200);
        })
    })
    .catch(logger.error);
};

module.exports = new Acl();