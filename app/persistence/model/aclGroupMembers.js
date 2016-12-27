var mongoose = require('mongoose');

var aclGroupMembersSchema = mongoose.Schema({
    aclUser: {
        type: mongoose.Schema.ObjectId, ref: 'AclUsers'
    },
    aclGroup: {
        type: mongoose.Schema.ObjectId, ref: 'AclGroups'
    }
});

module.exports = {
    connectionName: "main",
    modelName: "aclGroupMembers",
    schema: aclGroupMembersSchema
};