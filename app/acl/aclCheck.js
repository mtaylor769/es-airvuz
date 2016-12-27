'use strict';
var namespace = 'app.acl.aclCheck';

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var aclGroupMembersCrud1_0_0 = require('../persistence/crud/aclGroupMembers1-0-0');
    var aclUsersCrud1_0_0 = require('../persistence/crud/aclUsers1-0-0');

} catch (exception) {
    logger.error('require error:' + exception);
}

function aclCheck() {
}
// searches an array of objects for a value equal to one of the objects properties
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for (var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

function isAllowed(params) {
    //logger.info("linked User Id: " + params.linkedUserId);
    if (params.pass === true){
        // method level setting to not check permissions
        return true;
    }
    return aclUsersCrud1_0_0.getAclUserPermissions(params.linkedUserId)
        .then(function (acluser) {
            if (acluser) {
                if (acluser.permissions.length != 0) {
                    // search the users permissions for the required permissions
                    for (var e = 0, len = params.permission.length; e < len; e++) {
                        var matchFound = arrayObjectIndexOf(acluser.permissions, params.permission[e], 'name');
                        if (matchFound != -1) {
                            // remove the permission that matched from the required permissions array so its not searched for later
                            params.permission.shift();
                        }
                    }
                    if (params.permission.length === 0) {
                        // all the required permissions were matched with the users permissions,
                        // the required permissions array is empty
                        logger.info('user has each required permission(s) as user permissions');
                        return true;
                    } else {
                        logger.info('user does not have all required permissions as user permissions, checking group permissions');
                        // user does not have individual permissions
                        // get all the groups the user is a memeber of
                        // and check each groups permissions
                        return aclGroupMembersCrud1_0_0.getAclUsersGroups(acluser._id)
                            .then(function (group) {
                                //logger.info("aclgroup " + group);
                                if (group) {
                                    var aclGroupPermissions = [];
                                    // take each groups permissions returned as array objects and create a single array
                                    for (var i = 0; i < group.length; i++) {
                                        // check to see if one of the users groups is named 'root',
                                        // return true and stop checking if so
                                        if (group[i].aclGroup.name === 'root') {
                                            logger.info("user is in root group");
                                            return true;
                                        }

                                        for (var j = 0; j < group[i].aclGroup.permissions.length; j++) {
                                            //logger.info("group permissions " + group[i].aclGroup.permissions[j].name);
                                            aclGroupPermissions.push(group[i].aclGroup.permissions[j]);
                                        }
                                    }
                                    // search the compiled group permissions for the remaining required permissions
                                    for (var e = 0, len = params.permission.length; e < len; e++) {
                                        var matchFound = arrayObjectIndexOf(aclGroupPermissions, params.permission[e], 'name');
                                        if (matchFound != -1) {
                                            // remove the permission that matched from the required permissions array so its not searched for again
                                            // when this array is empty, all required permissions have been matched by
                                            // a user or group permission
                                            params.permission.shift();
                                        }
                                    }

                                    if (params.permission.length === 0) {
                                        // all the required permissions were matched with the users permissions
                                        logger.info('user has required permissions from group permissions');
                                        return true;
                                    } else {
                                        // users group permissions do not meet requirement
                                        logger.info('user does not have enough of required permissions as a group permission');
                                        return false;
                                    }
                                } else {
                                    // user has no group
                                    return false;
                                }
                            })
                            .catch(function (error) {
                                logger.error("error " + error);
                                return false;
                            });
                    }
                } else {
                    // the user has no permissions of their own, only possible group permissions
                    logger.info('user does not have all required permissions as user permissions, checking group permissions');
                    // user does not have ANY individual permissions
                    // get all the groups the user is a memeber of
                    // and check each groups permissions
                    return aclGroupMembersCrud1_0_0.getAclUsersGroups(acluser._id)
                        .then(function (group) {
                            logger.info("aclgroup " + group);
                            if (group) {
                                var aclGroupPermissions = [];
                                // take each groups permissions returned as array objects and create a single array
                                for (var i = 0; i < group.length; i++) {
                                    // check to see if one of the users groups is named 'root',
                                    // return true and stop checking if so
                                    if (group[i].aclGroup.name === 'root') {
                                        logger.info("user is in root group");
                                        return true;
                                    }
                                    for (var j = 0; j < group[i].aclGroup.permissions.length; j++) {
                                        logger.info("group permissions " + group[i].aclGroup.permissions[j].name);
                                        aclGroupPermissions.push(group[i].aclGroup.permissions[j]);
                                    }
                                }
                                // search the compiled group permissions for the remaining required permissions
                                for (var e = 0, len = aclGroupPermissions.length; e < len; e++) {
                                    var matchFound = arrayObjectIndexOf(aclGroupPermissions, params.permission[e], "name");
                                    if (matchFound != -1) {
                                        // remove the permission that matched from the required permissions array so its not searched for again
                                        // when this array is empty, all required permissions have been matched by
                                        // a user or group permission
                                        params.permission.shift();
                                    }
                                }

                                if (params.permission.length == 0) {
                                    // all the required permissions were matched with the users permissions
                                    logger.info('user has required permissions from group permissions');
                                    return true;
                                } else {
                                    // users group permissions do not meet requirement
                                    logger.info('user does not have enough of required permissions as a group permission');
                                    return false;
                                }
                            } else {
                                // user has no group
                                return false;
                            }
                        })
                        .catch(function (error) {
                            logger.error("error " + error);
                            return false;
                        });
                }
            } else {
                // acluser does not exist
                return false;
            }
        })
        .catch(function (error) {
            logger.error("error " + error);
        });
}

aclCheck.prototype.isAllowed = isAllowed;

module.exports = new aclCheck();

// TODO commment out logger.info's before pull request