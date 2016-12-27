var chai        = require('chai');
var chaiHttp    = require('chai-http');
var server      = 'http://' + process.env.NODE_TEST_ENV;
var expect      = require('chai').expect;

var testEmailAddress = process.env.TEST_EMAIL;
var userNameDisplay = process.env.TEST_USER;
var testPassword = process.env.TEST_PWD;

var token;
var userId;
var aclUserId;
var aclGroupId;
var permissions = [];
var savedPermissions = [];
var removedPermission = [];
var addedPermission = [];
var permissionRemoved = [];

chai.use(chaiHttp);

describe('aclgroup API tests', function () {
    before(function (done) {
        /**
         * Obtain a valid token using local login, then get the userid by searching
         */
        describe('get a token, userid, acluserid, permissions', function () {
            var request = chai.request(server);

            var getToken = function () {
                    return request
                        .post('/api/auth')
                        .send({emailAddress: testEmailAddress, password: testPassword})
                        .then(function (res) {
                            token = "Bearer " + res.text;
                            //return token;
                        });
                },
                getUserId = function () {
                    return request
                        .get('/api/users?username=' + userNameDisplay)
                        .set('Authorization', token)
                        .then(function (res) {
                            userId = res.body._id;
                            //return userId;
                        });
                },
                getAclUserId = function () {
                    return request
                        .get('/api/aclusers/?userid=' + userId)
                        .set('Authorization', token)
                        .then(function (res) {
                            aclUserId = res.body[0]._id;
                            // return aclUserId;
                    });
                },
                getAclPermissions = function () {
                    return request
                        .get('/api/aclpermissions/')
                        .set('Authorization', token)
                        .then(function (res) {
                            // get all the acl permissions
                            permissions = res.body;
                            // permissions array returned after create only contains Id's
                            // create an array of the permissions ID's to be used for checking
                            permissions.forEach(function (permission) {
                                savedPermissions.push(permission._id);
                            });
                            // get the first permission, use it for delete permission testing
                            removedPermission.push(permissions[0]._id);
                            // get the first permission, use it for add permission testing
                            addedPermission.push(permissions[0]._id);
                            // the array used to check if a permission was successfully removed
                            // remove the first element
                            permissionRemoved = permissions.slice(1, permissions.length);
                            done();
                    });
                };
            getToken()
                .then(getUserId)
                .then(getAclUserId)
                .then(getAclPermissions);
        });
    });
    describe('aclgroup test no apiVer', function () {
        var apiVer = 'apiVer=';
        describe('create a group', function () {
            it('should return the group data', function (done) {
                chai.request(server)
                    .post('/api/aclgroups/?' + apiVer)
                    .set('Authorization', token)
                    .send({
                        name: 'AclGroupsTesting',
                        groupOwner: 'testGroupOwner',
                        systemGroup: true,
                        groupType: 'testGroupType',
                        description: 'testDescription',
                        permissions: permissions
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.name).to.have.string('AclGroupsTesting');
                        expect(res.body.groupOwner).to.have.string('testGroupOwner');
                        expect(res.body.systemGroup).to.be.true;
                        expect(res.body.groupType).to.have.string('testGroupType');
                        expect(res.body.description).to.have.string('testDescription');
                        expect(res.body.permissions).to.eql(savedPermissions);
                        aclGroupId = res.body._id;
                        done();
                   });
            });
        });
        describe('read the group', function () {
            it('should return the group data', function (done) {
                chai.request(server)
                    .get('/api/aclgroups/AclGroupsTesting/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.name).to.have.string('AclGroupsTesting');
                        expect(res.body.groupOwner).to.have.string('testGroupOwner');
                        expect(res.body.systemGroup).to.be.true;
                        expect(res.body.groupType).to.have.string('testGroupType');
                        expect(res.body.description).to.have.string('testDescription');
                        expect(res.body.permissions).to.eql(permissions);
                        done();
                    });
            });
        });
        describe('update the group', function () {
            it('should return the group data', function (done) {
                chai.request(server)
                    .put('/api/aclgroups/' + aclGroupId + '/?' + apiVer)
                    .set('Authorization', token)
                    .send({
                        name: 'AclGroupsTestingUpdated',
                        groupOwner: 'testGroupOwnerUpdated',
                        systemGroup: false,
                        groupType: 'testGroupTypeUpdated',
                        description: 'testDescriptionUpdated'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.name).to.have.string('AclGroupsTestingUpdated');
                        expect(res.body.groupOwner).to.have.string('testGroupOwnerUpdated');
                        expect(res.body.systemGroup).to.be.false;
                        expect(res.body.groupType).to.have.string('testGroupTypeUpdated');
                        expect(res.body.description).to.have.string('testDescriptionUpdated');
                        done();
                    });
            });
        });
        describe('Delete permission from an aclGroup', function() {
            it('should return updated aclgroup data', function(done) {
                chai.request(server)
                    .put('/api/aclgroups/' + aclGroupId + '/permissions/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        permissions: removedPermission
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body._id).to.have.string(aclGroupId);
                        expect(res.body.name).to.have.string('AclGroupsTestingUpdated');
                        expect(res.body.groupOwner).to.have.string('testGroupOwnerUpdated');
                        expect(res.body.systemGroup).to.be.false;
                        expect(res.body.groupType).to.have.string('testGroupTypeUpdated');
                        expect(res.body.description).to.have.string('testDescriptionUpdated');
                        // expecting the returned permissions array to not include the permission that was removed
                        expect(res.body.permissions).to.eql(permissionRemoved);
                        done();
                    });
            });
        });
        describe('Add permission to an AclGroup', function() {
            it('should return updated aclgroup data', function(done) {
                chai.request(server)
                    .post('/api/aclgroups/' + aclGroupId + '/permissions/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        permissions: addedPermission
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body._id).to.have.string(aclGroupId);
                        expect(res.body.name).to.have.string('AclGroupsTestingUpdated');
                        expect(res.body.groupOwner).to.have.string('testGroupOwnerUpdated');
                        expect(res.body.systemGroup).to.be.false;
                        expect(res.body.groupType).to.have.string('testGroupTypeUpdated');
                        expect(res.body.description).to.have.string('testDescriptionUpdated');
                        // added the permission removed, the original permissions array should match
                        expect(res.body.permissions).to.deep.include.members(permissions);
                        done();
                    });
            });
        });
        describe('delete the group', function () {
            it('should return the group data', function (done) {
                chai.request(server)
                    .delete('/api/aclgroups/' + aclGroupId + '/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.name).to.have.string('AclGroupsTestingUpdated');
                        expect(res.body.groupOwner).to.have.string('testGroupOwnerUpdated');
                        expect(res.body.systemGroup).to.be.false;
                        expect(res.body.groupType).to.have.string('testGroupTypeUpdated');
                        expect(res.body.description).to.have.string('testDescriptionUpdated');
                        expect(res.body.permissions).to.deep.include.members(savedPermissions);
                        done();
                    });
            });
        });
        describe('try to delete an invalid group', function () {
            it('should return an error', function (done) {
                chai.request(server)
                    .delete('/api/aclgroups/5a350bc28e28d9145b1db31a/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('INFO', 'Nothing to delete!');
                        done();
                    });
            });
        });
    });
});