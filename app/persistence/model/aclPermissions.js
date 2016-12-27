var mongoose 			= require('mongoose');

var aclPermissionsSchema 		= mongoose.Schema({

    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String
    }
});

module.exports = {
    connectionName	: "main",
    modelName				: "AclPermissions",
    schema					: aclPermissionsSchema
};