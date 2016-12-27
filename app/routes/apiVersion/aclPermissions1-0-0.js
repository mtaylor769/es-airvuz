var namespace = 'app.routes.api.aclPermissions';

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var aclPermissionsCrud1_0_0 = require('../../persistence/crud/aclPermissions1-0-0');
    var acl = require('../../acl/aclCheck');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch (exception) {
    logger.error("import error:" + exception);
}


function AclPermissions() {
}
//<-------------------------------------------------------------------------------------------------------------------->
function create(req, res) {
    var params = {
        linkedUserId: req.user._id,
        permission: ['aclpermission-create']
    };

    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var params = {
                    name: req.body.name,
                    description: req.body.description
                };
                aclPermissionsCrud1_0_0.create(params)
                    .then(function (permission) {
                        res.json(permission);
                    })
                    .catch(function (error) {
                        logger.error("error while creating ACL Permission: " + error);
                        if (error.code === 11000) {
                            res.json({"error": "duplicate permission"});
                        } else {
                            res.json({"error": error.errors.name.message});
                        }
                    })
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error(error);
            res.json({"error": error});
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
function get(req, res) {

    var params = {
        linkedUserId: req.user._id,
        permission: ['aclpermission-read']
    };

    return acl.isAllowed(params)
        .then(function (accessCheck) {

            if (accessCheck) {
                // access granted
                // replace the commas in the fields query parameter with a space /g = global search
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var searchParams = {
                    id: req.params.id,
                    fields: fields
                }
                aclPermissionsCrud1_0_0.get(searchParams)
                    .then(function (permission) {

                        res.json(permission);
                    })
                    .catch(function (error) {
                        logger.error("error while getting ACL Permission: " + error);
                        res.json(error);
                    })
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error("error " + error);
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
function getAll(req, res) {

    var params = {
        linkedUserId: req.user._id,
        permission: ['aclpermission-read']
    };

    return acl.isAllowed(params)
        .then(function (accessCheck) {

            if (accessCheck) {
                // access granted
                aclPermissionsCrud1_0_0.getAll(req)
                    .then(function (permission) {

                        res.json(permission);
                    })
                    .catch(function (error) {
                        logger.error("error while getting all ACL Permissions: " + error);
                        res.json(error);
                    })
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error("error " + error);
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
function update(req, res) {

    var params = {
        linkedUserId: req.user._id,
        permission: ['aclpermission-update']
    };

    return acl.isAllowed(params)
        .then(function (accessCheck) {

            if (accessCheck) {
                // access granted
                var updateParams = {
                    id: req.params.id,
                    name: req.body.name,
                    description: req.body.description
                }
                aclPermissionsCrud1_0_0.update(updateParams)
                    .then(function (permission) {
                        if (!permission) {
                            res.json({"INFO": "Nothing to update!"});
                        }
                        res.json(permission);
                    })
                    .catch(function (error) {
                        logger.error("error while updating ACL Permission: " + error);
                        res.json(error);
                    })
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error("error " + error);
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
function remove(req, res) {

    var params = {
        linkedUserId: req.user._id,
        permission: ['aclpermission-delete']
    };

    return acl.isAllowed(params)
        .then(function (accessCheck) {

            if (accessCheck) {
                // access granted
                aclPermissionsCrud1_0_0.remove(req.params.id)
                    .then(function (permission) {
                        // if theres nothing returned then nothing was deleted
                        if (!permission) {
                            res.json({"INFO": "Nothing to delete!"});
                        } else {
                            res.json(permission);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while removing ACL Permission: " + error);
                        res.json(error);
                    });
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error("error " + error);
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
AclPermissions.prototype.create = create;
AclPermissions.prototype.get = get;
AclPermissions.prototype.getAll = getAll;
AclPermissions.prototype.update = update;
AclPermissions.prototype.remove = remove;

module.exports = new AclPermissions();