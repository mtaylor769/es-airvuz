var mongoose = require('mongoose');

var aclGroupsSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    groupOwner: {
        type: String
    },
    systemGroup: {
        type: Boolean
    },
    groupType: {
        type: String,
    },
    description: {
        type: String
    },
    permissions:
        [{ type: mongoose.Schema.ObjectId, ref: 'AclPermissions'}]
});

module.exports = {
    connectionName: "main",
    modelName: "AclGroups",
    schema: aclGroupsSchema
};