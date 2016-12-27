var namespace = 'app.routes.apiVersion.aclGroups1-0-0';

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var aclGroupsCrud1_0_0 = require('../../persistence/crud/aclGroups1-0-0');
    var acl = require('../../acl/aclCheck');
}
catch (exception) {
    logger.error(" import error:" + exception);
}

function AclGroups() {
}
//<-------------------------------------------------------------------------------------------------------------------->
function create(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-create']
    };
    // check to see if logged in user has access to create group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var createParams = {
                    name: req.body.name,
                    groupOwner: req.body.groupOwner,
                    systemGroup: req.body.systemGroup,
                    groupType: req.body.groupType,
                    description: req.body.description,
                    permissions: req.body.permissions
                };
                aclGroupsCrud1_0_0.create(createParams)
                    .then(function (group) {
                            res.json(group);
                        }
                    )
                    .catch(function (error) {
                        logger.error("error while creating an ACL Group: " + error);
                        if (error.code === 11000) {
                            res.json({"error": "duplicate system group"});
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
function getByName(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-read']
    };
    //logger.info("req user id: " + params.linkedUserId);
    // check to see if logged in user has access to get group

    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                // replace the commas in the fields query parameter with a space /g = global search
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var getParams = {
                    name: req.params.name,
                    fields: fields
                };
                aclGroupsCrud1_0_0.getByName(getParams)
                    .then(function (group) {
                        if (group === null) {
                            res.json({"INFO": "ACL Group not found"});
                        } else {
                            res.json(group);
                        }
                    })
                    .catch(function (error) {
                        logger.info("error while getting an ACL Group: " + error);
                        res.json(error);
                    });
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error(error);
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
function getAll(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-read']
    };
    // check to see if logged in user has access to get all groups
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                aclGroupsCrud1_0_0.getAll(req)
                    .then(function (group) {
                        if (!group) {
                            res.json({"INFO": "No AclGroups found"});
                        } else {
                            res.json(group);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while getting all ACL Groups: " + error);
                        res.json(error);
                    });
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error(error);
        })
}

//<-------------------------------------------------------------------------------------------------------------------->
function update(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-update']
    };
    // check to see if logged in user has access to update group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var updateParams = {
                    _id: req.params.id,
                    name: req.body.name,
                    groupOwner: req.body.groupOwner,
                    systemGroup: req.body.systemGroup,
                    groupType: req.body.groupType,
                    description: req.body.description
                };

                aclGroupsCrud1_0_0.update(updateParams)
                    .then(function (group) {
                        if (!group) {
                            res.json({"INFO": "Nothing to update!"});
                        }
                        res.json(group);
                    })
                    .catch(function (error) {
                        logger.error("error while updating ACL Group: " + error);
                        res.json(error);
                    });
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error(error);
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
function addPermissions(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-update']
    };
    // check to see if logged in user has access to update group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var updateParams = {
                    id: req.params.id,
                    permissions: req.body.permissions
                };
                aclGroupsCrud1_0_0.addPermissions(updateParams)
                    .then(function (group) {
                            res.json(group);
                    })
                    .catch(function (error) {
                        logger.error("error while adding permissions to ACL Group: " + error);
                        res.json(error);
                    });
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error(error);
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
function remove(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-delete']
    };
    // check to see if logged in user has access to delete group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var removeParams = {
                    id: req.params.id
                };
                aclGroupsCrud1_0_0.remove(removeParams)
                    .then(function (group) {
                        // if theres nothing returned then nothing was deleted
                        if (!group) {
                            res.json({"INFO": "Nothing to delete!"});
                        } else {
                            res.json(group);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while removing an ACL Group: " + error);
                        res.json(error);
                    });
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error(error);
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
function removePermissions(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-update']
    };
    // check to see if logged in user has access to delete group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var permissions = [];
                req.body.permissions.forEach(function(permission) {
                    permissions.push(permission)
                });
                var removeParams = {
                    id: req.params.id,
                    permissions: permissions
                };
                aclGroupsCrud1_0_0.removePermissions(removeParams)
                    .then(function (group) {
                        // if theres nothing returned then nothing was deleted
                        if (!group) {
                            res.json({"INFO": "Nothing to delete!"});
                        } else {
                            res.json(group);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while removing permissions from an ACL Group: " + error);
                        res.json(error);
                    });
                // access denied
            } else {
                logger.info(params.permission + " access denied for userId: " + req.user._id);
                res.status(401).json({"ERROR": "Access Denied"});
            }
        })
        .catch(function (error) {
            logger.error(error);
        })
}
//<-------------------------------------------------------------------------------------------------------------------->
AclGroups.prototype.create = create;
AclGroups.prototype.getByName = getByName;
AclGroups.prototype.getAll = getAll;
AclGroups.prototype.update = update;
AclGroups.prototype.addPermissions = addPermissions;
AclGroups.prototype.remove = remove;
AclGroups.prototype.removePermissions = removePermissions;

module.exports = new AclGroups();