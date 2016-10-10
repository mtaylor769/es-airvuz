var namespace = 'app.routes.apiVersion.acl1-0-0';

try {
    var log4js          = require('log4js');
    var logger          = log4js.getLogger(namespace);
    var acl             = require('../../utils/acl');
    var usersCrud1_0_0  = require('../../persistence/crud/users1-0-0');
}
catch(exception) {
    logger.error(" import error:" + exception);
}


function Acl() {}
/**
 *
 * @param req
 * @param res
 */
function put(req, res) {
    acl.isAllowed(req.user._id, 'acl', 'edit')
        .then(function (isAllow) {
            if (!isAllow) {
                res.sendStatus(400);
            }
            return usersCrud1_0_0
                .updateRoles(req.body)
                .then(function () {
                    res.sendStatus(200);
                })
        })
        .catch(logger.error);
}

Acl.prototype.put = put;

module.exports = new Acl();