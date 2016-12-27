var mongoose = require('mongoose');

var aclUsersSchema = mongoose.Schema({

    /*
     one to one relationship with Users collection
     links an AclUser to a User
     */
    linkedUserId: {
        type: String,
        required: true
    },
    permissions: [{
        type: mongoose.Schema.ObjectId,
        ref: 'AclPermissions',
        unique: true
    }]
});

module.exports = {
    connectionName: "main",
    modelName: "AclUsers",
    schema: aclUsersSchema
};

