'use strict';

var namespace = 'app.persistence.crud.aclGroupMembers1-0-0';

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var ErrorMessage = require('../../utils/errorMessage');
    var database = require('../database/database');
    var AclGroupMembersModel = database.getModelByDotPath({modelDotPath: 'app.persistence.model.aclGroupMembers'});

}
catch (exception) {
    logger.error(" import error:" + exception);
}

function AclGroupMembersCrud() {}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 create new group member record
 */
function create(params) {
    return (new AclGroupMembersModel(params)).save();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 get the groups with the user
 */
function getAclUsersGroups(params) {
    return AclGroupMembersModel.find({
            aclUser: params
        })
        .populate({ 'path': 'aclGroup',
            populate : { 'path' : 'permissions'}
        })
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 get the users in the group
 */
function getGroupMembers(params) {
    return AclGroupMembersModel.find({
        aclGroup: params.id
        })
        .populate({ 'path': 'aclUser',
            populate : { 'path' : 'permissions'}
        })
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 */
function get(params) {
    return AclGroupMembersModel.findById(params.id)
        .populate('permissions', params.fields)
        .select(params.fields)
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 get all the groups members, allows specifying fields to be returned and a limit
 /api/aclGroupMembers/?fields=name,routes
 */
function getAll(params) {
    return AclGroupMembersModel.find()
        .populate('aclUser', params.fields)
        .populate({ 'path': 'aclUser',
            populate : { 'path' : 'permissions'}
        })
        .populate('aclGroup', params.fields)
        .populate({ 'path': 'aclGroup',
            populate : { 'path' : 'permissions'}
        })
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 update an existing group member
 */
function update(params) {
    return AclGroupMembersModel.findByIdAndUpdate(params.id, params, {new:true}).lean().exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 delete a group member
 */
function remove(params) {
    return AclGroupMembersModel.findByIdAndRemove(params.id)
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 delete a group member
 */
function removeByAclUserId(params) {
    return AclGroupMembersModel.find({aclUser: params.aclUserId})
        .remove()
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
AclGroupMembersCrud.prototype.create                = create;
AclGroupMembersCrud.prototype.getAclUsersGroups     = getAclUsersGroups;
AclGroupMembersCrud.prototype.getGroupMembers     = getGroupMembers;
AclGroupMembersCrud.prototype.get                   = get;
AclGroupMembersCrud.prototype.getAll                = getAll;
AclGroupMembersCrud.prototype.update                = update;
AclGroupMembersCrud.prototype.remove                = remove;
AclGroupMembersCrud.prototype.removeByAclUserId     = removeByAclUserId;

module.exports = new AclGroupMembersCrud();