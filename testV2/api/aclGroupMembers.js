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
var aclGroupMemberId;

chai.use(chaiHttp);

describe('aclgroupmember API tests', function () {
    before(function (done) {

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
            getAclGroups = function () {
                return request
                    .get('/api/aclgroups/')
                    .set('Authorization', token)
                    .then(function (res) {
                        // get all the acl groups
                        aclGroupId = res.body[0]._id;
                        done();
                    });
            };
        getToken()
            .then(getUserId)
            .then(getAclUserId)
            .then(getAclGroups);
    });
    describe('aclgroupmember test no apiVer', function () {
        var apiVer = 'apiVer=';
        describe('create a groupmember', function () {
            it('should return the groupmember data', function (done) {
                chai.request(server)
                    .post('/api/aclgroupmembers/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        aclUser: aclUserId,
                        aclGroup: aclGroupId
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.aclUser).to.have.string(aclUserId);
                        expect(res.body.aclGroup).to.have.string(aclGroupId);
                        aclGroupMemberId = res.body._id;
                        done();
                    });
            });
        });
        describe('read the groupmember', function () {
            it('should return the groupmember data', function (done) {
                chai.request(server)
                    .get('/api/aclgroupmembers/' + aclGroupMemberId + '/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.aclUser).to.have.string(aclUserId);
                        expect(res.body.aclGroup).to.have.string(aclGroupId);
                        done();
                    });
            });
        });
        describe('update the groupmember', function () {
            it('should return the groupmember data', function (done) {
                chai.request(server)
                    .put('/api/aclgroupmembers/' + aclGroupMemberId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        aclUser: aclUserId,
                        aclGroup: aclGroupId
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.aclUser).to.have.string(aclUserId);
                        expect(res.body.aclGroup).to.have.string(aclGroupId);
                        done();
                    });
            });
        });
        describe('delete the groupmember', function () {
            it('should return the groupmember data', function (done) {
                chai.request(server)
                    .delete('/api/aclgroupmembers/' + aclGroupMemberId + '/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body.aclUser).to.have.string(aclUserId);
                        expect(res.body.aclGroup).to.have.string(aclGroupId);
                        done();
                    });
            });
        });
        describe('try to delete an invalid groupmember', function () {
            it('should return an error', function (done) {
                chai.request(server)
                    .delete('/api/aclgroupmembers/583508c28e28d9145b1db31a/?' + apiVer)
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