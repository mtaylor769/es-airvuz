var acl = require('../utils/acl');

/**
 * Determine if user has role in array
 * @param roles {array}
 * @returns {Function} express route
 */
module.exports = function (roles) {
  return function (req, res, next) {
    var user = req.user,
        canAccess = false;

    if (!user) {
      return res.sendStatus(403);
    }

    acl.userRoles(user._id)
      .then(function (userRoles) {
        userRoles.forEach(function (role) {
          // User can access if they have at least one of the roles
          if (roles.indexOf(role) > -1) {
            canAccess = true;
          }
        });

        if (!canAccess) {
          // User doesn't have access
          return res.sendStatus(403);
        }
        // User does have access
        next();
      });
  }
};