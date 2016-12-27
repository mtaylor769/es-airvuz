'use strict';

var namespace = 'app.persistence.crud.aclUsers1-0-0';

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var ErrorMessage = require('../../utils/errorMessage');
    var database = require('../database/database');
    var AclUsersModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.aclUsers"});

}
catch (exception) {
    logger.error(" import error:" + exception);
}

function AclUsersCrud() {}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 create a new AclUser
 */
function create(params) {
    return (new AclUsersModel(params)).save();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
get an aclUser details
 */
function get(params) {
    return AclUsersModel.findById(params.id)
        .populate('permissions', params.fields)
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 get an aclUser details by linkedUserId
 */
function getByUserId(linkeduserid) {
    return AclUsersModel.findOne({ "linkedUserId": linkeduserid })
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
get an aclUsers permissions by their userid
 */
function getAclUserPermissions(linkeduserid) {
    return AclUsersModel.findOne({ linkedUserId: linkeduserid })
        .populate('permissions', 'name description')
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 get all the aclusers, allows specifying fields to be returned and a limit
 /api/aclusers/?fields=name,routes
 */
function getAll(params) {
    return AclUsersModel.find()
        .populate('permissions', params.fields)
        .limit(params.limit)
        .select(params.fields)
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 update an existing User
 specify new:true to return the updated data and not the original data
 */
function update(params) {
    var user = {};
    user.id = params.id;
    user.linkedUserId = params.linkedUserId;
    return AclUsersModel.findByIdAndUpdate(user.id,
        {
            linkedUserId: user.linkedUserId
        }, {
            new: true
        })
        .populate('permissions')
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 add permissions
 */
function addPermissions(params) {
    return AclUsersModel.findByIdAndUpdate(params.id,
        {
            "$addToSet": {
                "permissions": params.permission
            }
        }, {
            new: true
        })
        .populate('permissions', params.fields)
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 delete an aclUser
 */
function remove(params) {
    return AclUsersModel.findByIdAndRemove(params.id)
        .populate('permissions', params.fields)
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 remove permissions
 */
function removePermissions(params) {
    return AclUsersModel.findByIdAndUpdate(params.id,
        {
            "$pull": {
                "permissions": {
                    "$in": params.permissions
                }
            }
        }, {
            // new: true returns the updated values
            new: true
        })
        .populate('permissions', params.fields)
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
AclUsersCrud.prototype.create = create;
AclUsersCrud.prototype.get = get;
AclUsersCrud.prototype.getByUserId = getByUserId;
AclUsersCrud.prototype.getAclUserPermissions = getAclUserPermissions;
AclUsersCrud.prototype.getAll = getAll;
AclUsersCrud.prototype.update = update;
AclUsersCrud.prototype.addPermissions = addPermissions;
AclUsersCrud.prototype.remove = remove;
AclUsersCrud.prototype.removePermissions = removePermissions;

module.exports = new AclUsersCrud();