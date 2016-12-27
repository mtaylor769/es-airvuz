try {
    var log4js = require('log4js');
    var logger = log4js.getLogger();
    var mongoose = require('mongoose');
    var Promise = require('bluebird');

    var aclPermissionsCrud = require('../app/persistence/crud/aclPermissions1-0-0');
    var aclGroupCrud = require('../app/persistence/crud/aclGroups1-0-0');
    var aclGroupMemberCrud = require('../app/persistence/crud/aclGroupMembers1-0-0');
    var aclUserCrud = require('../app/persistence/crud/aclUsers1-0-0');
    var userCrud = require('../app/persistence/crud/users1-0-0');
}
catch (exception) {
    logger.error("import error: " + exception);
}

var DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
var databaseOptions = {
    user: process.env.DATABASE_USER || '',
    pass: process.env.DATABASE_PASSWORD || '',
    auth: {
        authdb: 'admin'
    }
};

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://' + DATABASE_HOST + '/AirVuz2', databaseOptions);

var rootGroupOID;

function addPermissions() {
    return Promise.each(aclPermissionsToAdd, function (permission) {
        return aclPermissionsCrud.create(permission)
            .then(function (result) {
                logger.info('permission created: ' + result);
                permission._id = result._id;
            })
            .catch(function (error) {
                logger.error(error);
            });
    });
}

function addGroups() {
    return Promise.each(aclGroupsToAdd, function (group) {
        return aclGroupCrud.create({
            name: group.name,
            description: group.description
            })
            .then(function (result) {
                logger.info('group created: ' + result);
                if (result.name === 'root') {
                    rootGroupOID = result._id;
                }
                group._id = result._id;
            })
            .catch(function (error) {
                logger.error(error);
            });
    });
}

function addRootUsers() {
    return Promise.each(aclUsersToAdd, function (user) {
        return userCrud.getByUserName(user.userNameDisplay)
            .then(function (result) {
                return aclUserCrud.create({
                    linkedUserId: result._id
                })
                    .then(function(acluser){
                        logger.info('acluser created: ' + acluser);
                        return aclGroupMemberCrud.create({
                            aclUser: acluser._id,
                            aclGroup: rootGroupOID
                        })
                        .then(function(groupmember){
                            logger.info('aclgroupmember created: '+ groupmember);
                        });
                    })
                    .catch(function(error){
                        logger.error(error);
                    });
            })
            .catch(function (error) {
                logger.error(error);
            })
    })
}

function addPermissionsToGroups() {
    return Promise.each(aclGroupsToAdd, function(group) {
        if (!group.permissions) {
            return;
        }
        for (var i=0; i < group.permissions.length; i++){
            var permission = aclPermissionsToAdd.find(function(arr){
                return arr.name == group.permissions[i].name;
            });
            group.permissions[i]._id = permission._id;
        }
        for (var i=0; i < group.permissions.length; i++){
            return aclGroupCrud.addPermissions({
                id: group._id,
                permissions: [group.permissions[i]._id]
                })
                .then(function(group){
                    logger.info("group updated: " + group)
                })
                .catch(function(error){
                    logger.error(error);
                });
        }
    });
}

function closeDatabaseConnection() {
    mongoose.connection.close();
    console.log('******************** close database connection ********************');
    process.exit();
}

var aclPermissionsToAdd = [
    {
        "name": "aclpermission-read",
        "description": "Read any ACL permission"
    },
    {
        "name": "aclpermission-update",
        "description": "Update any ACL Permission"
    },
    {
        "name": "aclpermission-delete",
        "description": "Delete any ACL Permission"
    },
    {
        "name": "aclgroup-create",
        "description": "Create a group policy"
    },
    {
        "name": "aclgroup-read",
        "description": "Read a group policy"
    },
    {
        "name": "aclgroup-update",
        "description": "Update a group policy"
    },
    {
        "name": "aclgroup-delete",
        "description": "Delete a group policy"
    },
    {
        "name": "acluser-delete",
        "description": "Delete a user policy"
    },
    {
        "name": "acluser-create",
        "description": "Create a user policy"
    },
    {
        "name": "acluser-read",
        "description": "View a user policy"
    },
    {
        "name": "acluser-update",
        "description": "Update a user policy"
    },
    {
        "name": "aclgroupmember-create",
        "description": "Assign group policy members"
    },
    {
        "name": "aclgroupmember-read",
        "description": "View group policy members"
    },
    {
        "name": "aclgroupmember-update",
        "description": "Update a group policy member"
    },
    {
        "name": "aclgroupmember-delete",
        "description": "Remove a group policy member"
    },
    {
        "name": "aclpermission-create",
        "description": "Create an ACL Permission"
    },
    {
        "name": "user-delete",
        "description": "Delete a user"
    },
    {
        "name": "user-update",
        "description": "Update a user"
    },
    {
        "name": "video-curation-update",
        "description": "Curate any video"
    },
    {
        "name": "comment-delete",
        "description": "Delete a comment on any video"
    }
];

var aclGroupsToAdd = [
    {
        "name": "AclUserAdmins",
        "description": "Includes permissions to manage users and user policies",
        "permissions": [
            {"name": "user-delete"},
            {"name": "user-update"},
            {"name": "acluser-delete"},
            {"name": "acluser-create"},
            {"name": "acluser-read"},
            {"name": "acluser-update"}
        ]
    },
    {
        "name": "AclGroupAdmins",
        "description": "Includes permissions to manage group policies",
        "permissions": [
            {"name": "aclgroup-delete"},
            {"name": "aclgroup-create"},
            {"name": "aclgroup-read"},
            {"name": "aclgroup-update"}
        ]
    },
    {
        "name": "AclPermissionsAdmins",
        "description": "Includes permissions to manage permissions",
        "permissions": [
            {"name": "aclpermission-delete"},
            {"name": "aclpermission-create"},
            {"name": "aclpermission-read"},
            {"name": "aclpermission-update"}
        ]
    },
    {
        "name": "root",
        "description": "The Roots.",
    },
    {
        "name": "VideoAdmins",
        "description": "Includes permissions to administer videos"
    },
    {
        "name": "UserAdmins",
        "description": "Includes permissions to administer users",
        "permissions": [
            {"name": "user-delete"},
            {"name": "user-update"},
            {"name": "acluser-delete"},
            {"name": "acluser-create"},
            {"name": "acluser-read"},
            {"name": "acluser-update"}
        ]
    },
    {
        "name": "VideoCurators",
        "description": "Includes permissions to update video curation",
        "permissions": [
            {"name": "video-curation-update"}
        ]
    },
    {
        "name": "CommentAdmins",
        "description": "Includes permissions to remove comments",
        "permissions": [
            {"name": "comment-delete"}
        ]
    }
];

var aclUsersToAdd = [
    {
        "userNameDisplay": "ghost2"
    },
    {
        "userNameDisplay": "testingUser"
    },
    {
        "userNameDisplay": "karl_jones"
    },
    {
        "userNameDisplay": "koul"
    },
    {
        "userNameDisplay": "minnesnowta"
    },
    {
        "userNameDisplay": "Doua Thao"
    }
];

mongoose.connection.once('connected', function() {
    addPermissions()
        .then(addGroups)
        .then(addRootUsers)
        .then(addPermissionsToGroups)
        .finally(closeDatabaseConnection)
});