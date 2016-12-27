'use strict';

var namespace = 'app.persistence.crud.aclPermissions1-0-0';

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var database = require('../database/database');
    var AclPermissionsModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.aclPermissions"});

}
catch (exception) {
    logger.error(" import error:" + exception);
}

function aclPermissionCrud() {}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 create a new Permission definition
 */
function create(params) {
    return (new AclPermissionsModel(params)).save();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
get a single permission
 */
function get(params) {
    return AclPermissionsModel.findById(params.id).select(params.fields).lean().exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 get all the Permissions, allows specifying fields to be returned and a limit
 /api/aclPermissions/?fields=name,routes
 */
function getAll(req) {
    // replace the commas in the fields query parameter with a space /g = global search
    if (req.query.fields) {
        var fields = req.query.fields.replace(/,/g , ' ');
    }
    return AclPermissionsModel.find().select(fields).limit(parseInt(req.query.limit)).lean().exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 update an existing Permission definition
 */
function update(params) {
    return AclPermissionsModel.findByIdAndUpdate(params.id, params, {new:true}).lean().exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 delete a Permission definition
 */
function remove(id) {
    return AclPermissionsModel.findOneAndRemove({_id: id}).lean().exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
aclPermissionCrud.prototype.create        = create;
aclPermissionCrud.prototype.get           = get;
aclPermissionCrud.prototype.getAll                  = getAll;
aclPermissionCrud.prototype.update        = update;
aclPermissionCrud.prototype.remove        = remove;

module.exports = new aclPermissionCrud();