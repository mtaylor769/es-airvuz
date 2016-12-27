var namespace = 'app.routes.apiVersion.aclUsers1-0-0';

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var aclUsersCrud1_0_0 = require('../../persistence/crud/aclUsers1-0-0');
    var aclGroupMembersCrud1_0_0 = require('../../persistence/crud/aclGroupMembers1-0-0');
    var usersCrud1_0_0 = require('../../persistence/crud/users1-0-0');
    var acl = require('../../acl/aclCheck');
}
catch (exception) {
    logger.error(" import error:" + exception);
}

function AclUsers() {}
//<-------------------------------------------------------------------------------------------------------------------->
function create(req, res) {
    var params = {
        linkedUserId: req.user._id,
        permission: ['acluser-create']
    };
    // check to see if logged in user has access to create an acl user
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var createParams = {
                    linkedUserId: req.body.linkedUserId,
                    permissions: req.body.permissions
                };
                aclUsersCrud1_0_0.create(createParams)
                    .then(function (user) {
                        res.json(user);
                    })
                    .catch(function (error) {
                        logger.error(error);
                        res.json(error.error);
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
function get(req, res) {
    var params = {
        linkedUserId: req.user._id,
        permission: ['acluser-read']
    };
    // check to see if logged in user is an acluser
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                // api/aclusers/?fields=name,routes
                // replace the commas in the fields query parameter with a space /g = global search
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var getParams = {
                    id: req.params.id,
                    fields: fields
                };
                aclUsersCrud1_0_0.get(getParams)
                    .then(function (user) {
                        if (!user) {
                            res.json({"INFO": "AclUser not found"});
                        } else {
                            res.json(user);
                        }
                    })
                    .catch(function (error) {
                        logger.info("error: " + error);
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
        permission: ['acluser-read']
    };
    // check to see if logged in user has access to get all acl users
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                // /api/acluser/:id/?fields=permissions,name
                // replace the commas in the fields query parameter with a space /g = global search
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                // /api/aclusers/?limit-10
                var limit = parseInt(req.query.limit);

                var getAllParams = {
                    fields: fields,
                    limit: limit
                };
                aclUsersCrud1_0_0.getAll(getAllParams)
                    .then(function (user) {
                        if (!user) {
                            res.json({"INFO" : "No AclUsers Found"});
                        } else {
                            res.json(user);
                        }
                    })
                    .catch(function (error) {
                        logger.error(error);
                        res.json(error.error);
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
/*
search for an ACLUser by providing username in url - /api/aclusers/search/:username
 */
function search(req, res) {
    var params = {
        linkedUserId: req.user._id,
        permission: ['acluser-read']
    };
    // check to see if logged in user has access to get acl user
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                usersCrud1_0_0.getByUserName(req.params.username)
                    .then(function (user) {
                        if (user == null) {
                            res.json({"INFO" : "No user found"});
                        } else {
                            aclUsersCrud1_0_0.getAclUserPermissions(user._id)
                                .then(function (acluser) {
                                    if (acluser == null) {
                                        // user is not an acluser, but still return user details to display to the end user
                                        // /admin/acl/users > search > result
                                        res.json({"INFO" : "User is not an ACL User",
                                            linkedUserId: user._id,
                                            userNameDisplay: user.userNameDisplay,
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            emailAddress: user.emailAddress
                                        });
                                    } else {
                                        aclGroupMembersCrud1_0_0.getAclUsersGroups(acluser)
                                            .then(function (aclgroups) {
                                                // return acluser with additional fields for admin user interface - /admin/acl/users
                                                var updatedAclUser = {
                                                    id : acluser._id,
                                                    firstName: user.firstName,
                                                    lastName: user.lastName,
                                                    emailAddress: user.emailAddress,
                                                    permissions: acluser.permissions,
                                                    linkedUserId: acluser.linkedUserId,
                                                    userNameDisplay: user.userNameDisplay,
                                                    status: user.status,
                                                    lastLoginDate: user.lastLoginDate,
                                                    accountCreatedDate: user.accountCreatedDate,
                                                    groups: aclgroups
                                                }
                                                res.json(updatedAclUser);
                                            })
                                            .catch(function (error) {
                                                logger.error("aclGroupMembersCrud1_0_0.getAclUsersGroups " + error);
                                                res.json(error.error);
                                            });
                                    }
                                })
                                .catch(function (error) {
                                    logger.error("aclUsersCrud1_0_0.getAclUserPermissions " + error);
                                    res.json(error);
                                });
                        }
                    })
                    .catch(function (error) {
                        logger.error("usersCrud1_0_0.getByUserName " + error);
                        res.json(error.error);
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
        permission: ['acluser-update']
    };
    // check to see if logged in user has access to update an acl user
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var updateParams = {
                    linkedUserId : req.body.linkedUserId
                }
                aclUsersCrud1_0_0.update(updateParams)
                    .then(function (user) {
                        res.json(user);
                    })
                    .catch(function (error) {
                        logger.error(error);
                        res.json(error.error);
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
        permission: ['acluser-update']
    };
    // check to see if logged in user has access to update user
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                // /api/acluser/:id/?fields=permissions,name
                // replace the commas in the fields query parameter with a space /g = global search
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var updateParams = {
                    id: req.params.id,
                    permission: req.body.permission,
                    fields: fields
                };
                aclUsersCrud1_0_0.addPermissions(updateParams)
                    .then(function (user) {
                        if (!user) {
                            res.json({"INFO": "Nothing to delete!"});
                        } else {
                            res.json(user);
                        }
                    })
                    .catch(function (error) {
                        logger.error(error);
                        res.json(error.message);
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
        permission: ['acluser-delete']
    };
    // check to see if logged in user has access to delete an acl user
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                // /api/acluser/:id/?fields=permissions,name
                // replace the commas in the fields query parameter with a space /g = global search
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var removeParams = {
                    id: req.params.id,
                    fields: fields
                }
                aclUsersCrud1_0_0.remove(removeParams)
                    .then(function (user) {
                        // if theres nothing returned then nothing was deleted
                        if (!user) {
                            res.json({"INFO": "Nothing to delete!"});
                        }
                        res.json(user);
                    })
                    .catch(function (error) {
                        logger.error(error);
                        res.json(error.error);
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
        // the permission required of the user or users user to gain access
        permission: ['acluser-update']
    };
    // check to see if logged in user has access to delete user
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                // /api/acluser/:id/?fields=permissions,name
                // replace the commas in the fields query parameter with a space /g = global search
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var permissions = [];
                req.body.permissions.forEach(function(permission) {
                    permissions.push(permission)
                });
                var removeParams = {
                    id: req.params.id,
                    permissions: permissions,
                    fields: fields
                };
                aclUsersCrud1_0_0.removePermissions(removeParams)
                    .then(function (user) {
                        // if theres nothing returned then nothing was deleted
                        if (!user) {
                            res.json({"INFO": "Nothing to delete!"});
                        } else {
                            res.json(user);
                        }
                    })
                    .catch(function (error) {
                        logger.error(error);
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
AclUsers.prototype.create = create;
AclUsers.prototype.get = get;
AclUsers.prototype.getAll = getAll;
AclUsers.prototype.search = search;
AclUsers.prototype.update = update;
AclUsers.prototype.addPermissions = addPermissions;
AclUsers.prototype.remove = remove;
AclUsers.prototype.removePermissions = removePermissions;

module.exports = new AclUsers();
