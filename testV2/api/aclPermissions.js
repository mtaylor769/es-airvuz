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
var permissions;
var aclPermissionId;

chai.use(chaiHttp);

describe('aclpermission API tests', function () {
    before(function (done) {
        /**
         * Obtain a valid token using local login, then get the userid by searching
         */
        describe('get a token', function() {
            chai.request(server)
                .post('/api/auth')
                .send({emailAddress: testEmailAddress, password: testPassword})
                .then(function (res) {
                    return token = "Bearer " + res.text;
                })
                .then(function(token) {
                    chai.request(server)
                        .get('/api/users?username=' + userNameDisplay)
                        .set('Authorization', token)
                        .end(function(err, res){
                            userId = res.body._id;
                            done();
                        });
                });
        });
    });
    describe('aclpermission test no apiVer', function () {
        var apiVer = 'apiVer=';
        describe('create a permission', function () {
            it('should return the permission data', function (done) {
                chai.request(server)
                    .post('/api/aclpermissions/?' + apiVer)
                    .set('Authorization', token)
                    .send({
                        name: 'ACLPermissionsTesting',
                        description: 'TestingDescription'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.name).to.have.string('ACLPermissionsTesting');
                        expect(res.body.description).to.have.string('TestingDescription');
                        aclPermissionId = res.body._id;
                        done();
                    });
            });
        });
        describe('read the permission', function () {
            it('should return the permission data', function (done) {
                chai.request(server)
                    .get('/api/aclpermissions/' + aclPermissionId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.name).to.have.string('ACLPermissionsTesting');
                        expect(res.body.description).to.have.string('TestingDescription');
                        done();
                    });
            });
        });
        describe('update the permission', function () {
            it('should return the permission data', function (done) {
                chai.request(server)
                    .put('/api/aclpermissions/' + aclPermissionId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        name: 'UpdatedACLPermissionTesting',
                        description: 'UpdatedDescription'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.name).to.have.string('UpdatedACLPermissionTesting');
                        expect(res.body.description).to.have.string('UpdatedDescription');
                        done();
                    });
            });
        });
        describe('delete the permission', function () {
            it('should return the permission data', function (done) {
                chai.request(server)
                    .delete('/api/aclpermissions/' + aclPermissionId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.name).to.have.string('UpdatedACLPermissionTesting');
                        expect(res.body.description).to.have.string('UpdatedDescription');
                        done();
                    });
            });
        });
        describe('try to delete an invalid permission', function () {
            it('should return an error', function (done) {
                chai.request(server)
                    .delete('/api/aclpermissions/583508c28e28d9145b1db31a/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
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