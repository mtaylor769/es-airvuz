var namespace = 'app.routes.apiVersion.aclGroupMembers1-0-0';

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var aclGroupMembersCrud1_0_0 = require('../../persistence/crud/aclGroupMembers1-0-0');
    var acl = require('../../acl/aclCheck');
}
catch (exception) {
    logger.error(" import error:" + exception);
}

function AclGroupMembers() {
}
//<-------------------------------------------------------------------------------------------------------------------->
function create(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroupmember-create']
    };
    // check to see if logged in user has access to create group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var createParams = {
                    aclUser: req.body.aclUser,
                    aclGroup: req.body.aclGroup
                }
                aclGroupMembersCrud1_0_0.create(createParams)
                    .then(function (group) {
                            res.json(group);
                    })
                    .catch(function (error) {
                        logger.error("error while creating an ACL Group Member: " + error);
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
        });
}
//<-------------------------------------------------------------------------------------------------------------------->
function get(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-read']
    };
    // check to see if logged in user has access to get group
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
                aclGroupMembersCrud1_0_0.get(searchParams)
                    .then(function (groupmember) {
                        if (!groupmember) {
                            res.json({"INFO": "AclGroupMember not found"});
                        } else {
                            res.json(groupmember);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while getting an ACL Group Member: " + error);
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
        });
}
//<-------------------------------------------------------------------------------------------------------------------->
function getAclUsersGroups(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-read']
    };
    // check to see if logged in user has access to get group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                // replace the commas in the fields query parameter with a space /g = global search
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var searchParams = {
                    _id: req.params.id,
                    fields: fields
                }
                aclGroupMembersCrud1_0_0.getAclUsersGroups(searchParams)
                    .then(function (groupmember) {
                        if (!groupmember) {
                            res.json({"INFO": "AclUser not found"});
                        } else {
                            res.json(groupmember);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while getting an ACL Group Member: " + error);
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
        });
}
//<-------------------------------------------------------------------------------------------------------------------->
function getGroupMembers(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroup-read']
    };
    // check to see if logged in user has access to get group
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
                aclGroupMembersCrud1_0_0.getGroupMembers(searchParams)
                    .then(function (groupmember) {
                        if (groupmember.length == 0) {
                            res.json([{"INFO": "No ACL users in this group"}]);
                        } else {
                            res.json(groupmember);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while getting an ACL Group Member: " + error);
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
        });
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
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var getAllParams = {
                    fields: fields
                }
                aclGroupMembersCrud1_0_0.getAll(getAllParams)
                    .then(function (group) {
                        res.json(group);
                    })
                    .catch(function (error) {
                        logger.error("error while getting all ACL Group Members: " + error);
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
        });
}
//<-------------------------------------------------------------------------------------------------------------------->
function update(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroupmember-update']
    };
    // check to see if logged in user has access to update group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                var updateParams = {
                    id: req.params.id,
                    aclUser: req.body.aclUser,
                    aclGroup: req.body.aclGroup
                }
                aclGroupMembersCrud1_0_0.update(updateParams)
                    .then(function (groupmember) {
                        if (!groupmember) {
                            res.json({"INFO": "Nothing to update!"});
                        } else {
                            res.json(groupmember);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while updating ACL Group Member: " + error);
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
        });
}
//<-------------------------------------------------------------------------------------------------------------------->
function remove(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroupmember-delete']
    };
    // check to see if logged in user has access to delete group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var removeParams = {
                    id: req.params.id,
                    fields: fields
                };
                aclGroupMembersCrud1_0_0.remove(removeParams)
                    .then(function (groupmember) {
                        // if theres nothing returned then nothing was deleted
                        if (!groupmember) {
                            res.json({"INFO": "Nothing to delete!"});
                        } else {
                            res.json(groupmember);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while removing ACL Group Member: " + error);
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
        });
}
//<-------------------------------------------------------------------------------------------------------------------->
function removeByAclUserId(req, res) {
    var params = {
        linkedUserId: req.user._id,
        // the permission required of the user or users group to gain access
        permission: ['aclgroupmember-delete']
    };
    // check to see if logged in user has access to delete group
    return acl.isAllowed(params)
        .then(function (accessCheck) {
            if (accessCheck) {
                // access granted
                if (req.query.fields) {
                    var fields = req.query.fields.replace(/,/g, ' ');
                }
                var removeParams = {
                    aclUserId: req.params.id,
                    fields: fields
                };
                aclGroupMembersCrud1_0_0.removeByAclUserId(removeParams)
                    .then(function (groupmember) {
                        // if theres nothing returned then nothing was deleted
                        if (!groupmember) {
                            res.json({"INFO": "Nothing to delete!"});
                        } else {
                            res.json(groupmember);
                        }
                    })
                    .catch(function (error) {
                        logger.error("error while removing ACL Group Member: " + error);
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
        });
}
//<-------------------------------------------------------------------------------------------------------------------->
AclGroupMembers.prototype.create = create;
AclGroupMembers.prototype.get = get;
AclGroupMembers.prototype.getAclUsersGroups = getAclUsersGroups;
AclGroupMembers.prototype.getGroupMembers = getGroupMembers;
AclGroupMembers.prototype.getAll = getAll;
AclGroupMembers.prototype.update = update;
AclGroupMembers.prototype.remove = remove;
AclGroupMembers.prototype.removeByAclUserId = removeByAclUserId;

module.exports = new AclGroupMembers();