'use strict';

var namespace = 'app.persistence.crud.aclgroups1-0-0';

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger(namespace);
    var Promise = require('bluebird');
    var ErrorMessage = require('../../utils/errorMessage');
    var database = require('../database/database');
    var AclGroupsModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.aclGroups"});

}
catch (exception) {
    logger.error(" import error:" + exception);
}

function aclGroupCrud() {
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 create a new Group definition
 */
function create(params) {
    return (new AclGroupsModel(params)).save();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 get a single group by id
 */
function getByName(params) {
    return AclGroupsModel.findOne({name: params.name})
        .populate('permissions', params.fields)
        .select(params.fields)
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 get all the groups, allows specifying fields to be returned and a limit
 /api/aclgroups/?fields=name,routes
 */
function getAll(req) {
    // replace the commas in the fields query parameter with a space /g = global search
    if (req.query.fields) {
        var fields = req.query.fields.replace(/,/g, ' ')
    }
    return AclGroupsModel.find()
        .populate('permissions', fields)
        .populate('members', fields)
        .limit(parseInt(req.query.limit))
        .lean()
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 update an existing Group
 */
function update(params) {
    return AclGroupsModel.findByIdAndUpdate(params._id, params, {new: true})
        .populate('permissions', 'name description')
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 add permissions
 */
function addPermissions(params) {
    return AclGroupsModel.findByIdAndUpdate(params.id,
        {
            "$addToSet": {
                "permissions": {
                    "$each": params.permissions
                }
            }
        }, {
            // new: true returns the updated values (default is to return original values)
            new: true
        })
        .populate('permissions')
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 delete a Group
 */
function remove(params) {
    return AclGroupsModel.findByIdAndRemove(params.id).exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
/*
 remove permissions
 */
function removePermissions(params) {
    return AclGroupsModel.findByIdAndUpdate(params.id,
        {
            "$pull": {
                "permissions": {
                    "$in": params.permissions
                }
            }
        }, {
            // new: true returns the updated values (default is to return original values)
            new: true
        })
        .populate('permissions')
        .exec();
}
//<-------------------------------------------------------------------------------------------------------------------->
aclGroupCrud.prototype.create = create;
aclGroupCrud.prototype.getByName = getByName;
aclGroupCrud.prototype.getAll = getAll;
aclGroupCrud.prototype.update = update;
aclGroupCrud.prototype.addPermissions = addPermissions;
aclGroupCrud.prototype.remove = remove;
aclGroupCrud.prototype.removePermissions = removePermissions;

module.exports = new aclGroupCrud();