var chai        = require('chai');
var chaiHttp    = require('chai-http');
var server      = 'http://' + process.env.NODE_TEST_ENV;
var expect      = require('chai').expect;

var testEmailAddress = process.env.TEST_EMAIL;
var userNameDisplay = process.env.TEST_USER;
var testPassword = process.env.TEST_PWD;

var token;
var userId;
var acluserId;
var permissions = [];
var savedPermissions = [];
var removedPermission = [];
var addedPermission = [];
var permissionRemoved = [];

chai.use(chaiHttp);

describe('acluser API tests', function() {
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
                getAclPermissions = function () {
                    return request
                        .get('/api/aclpermissions/?fields=id,name,description')
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
                .then(getAclPermissions);
        });
    });
    describe('acluser test no apiVer', function() {
        var apiVer = 'apiVer=';
        describe('create an acluser', function() {
            it('should return json containing the acluser data just submitted', function(done) {
                chai.request(server)
                    .post('/api/aclusers/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        linkedUserId: userId,
                        permissions: permissions
                    })
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body.linkedUserId).to.have.string(userId);
                        expect(res.body.permissions).to.eql(savedPermissions);
                        acluserId = res.body._id;
                        done();
                    });
            });
        });
        describe('Get the acluser just posted', function() {
            it('should return json containing the acluser data just submitted', function(done) {
                chai.request(server)
                    .get('/api/aclusers/' + acluserId + '/?fields=id,name,description,linkedUserId/&' + apiVer)
                    .set('Authorization', token)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body._id).to.have.string(acluserId);
                        expect(res.body.linkedUserId).to.have.string(userId);
                        expect(res.body.permissions).to.eql(permissions);
                        done();
                    });
            });
        });
        describe('Delete permission from an AclUser', function() {
            it('should return updated acluser data', function(done) {
                chai.request(server)
                    .put('/api/aclusers/' + acluserId + '/permissions/?fields=id,name,description&' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        permissions: removedPermission
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body._id).to.have.string(acluserId);
                        expect(res.body.linkedUserId).to.have.string(userId);
                        // expecting the returned permissions array to not include the permission that was removed
                        expect(res.body.permissions).to.eql(permissionRemoved);
                        done();
                    });
            });
        });
        describe('Add permission to an AclUser', function() {
            it('should return updated acluser data', function(done) {
                chai.request(server)
                    .post('/api/aclusers/' + acluserId + '/permissions/?fields=id,name,description&' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        permissions: addedPermission
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body._id).to.have.string(acluserId);
                        expect(res.body.linkedUserId).to.have.string(userId);
                        // added the permission removed, the original permissions array should match
                        expect(res.body.permissions).to.deep.include.members(permissions);
                        done();
                    });
            });
        });
        describe('Delete the acluser just created', function() {
            it('should delete the fuckin acluser man', function(done) {
                chai.request(server)
                    .delete('/api/aclusers/' + acluserId + '/?fields=id,name,description&' + apiVer)
                    .set('Authorization', token)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');

                        done();
                    });
            });
        });
    });
});