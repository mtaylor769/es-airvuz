var chai = require('chai');
var chaiHttp = require('chai-http');
var server  = 'http://localhost';
var expect = require('chai').expect;

var token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2U5NmE3MTlkZGQyYjAyZjQ0ZjMzNjciLCJhY2xSb2xlcyI6WyJ1c2VyLWdlbmVyYWwiXSwiaWF0IjoxNDc2MjE1NTEzLCJleHAiOjE0Nzg4MDc1MTN9.kE3L7h4ojbmpd1YlAC94DvKvTN4evoaYOQPTlplgCV8';
var userId = '57e96a719ddd2b02f44f3367';
var userNameDisplay = 'bryceb';

chai.use(chaiHttp);

describe('Users tests no apiVer', function() {
    /**
     * Attempt to get data for a known user
     * prerequisites: userId exists, valid token
     */
    describe('Retrieve user info', function() {
        it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function(done) {
            chai.request(server)
                .get('/api/users/' + userId)
                .set('Authorization', token)
                .end(function (err, res) {
                    var data = res.body;
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                    expect(data).to.have.property('_id');
                    expect(data).to.have.property('userNameDisplay');
                    expect(data).to.have.property('emailAddress');
                    expect(data).to.have.property('userNameUrl');
                    expect(data).to.have.property('aclRoles');
                    done();
                });
        });
    });
    /**
     * Attempt to get data for an invalid user NOTE: in the current version this hangs the request
     * prereq: token valid
     */
    // describe('Retrieve user info', function() {
    //     it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function(done) {
    //         chai.request(server)
    //             .get('/api/users/8888888888888888888888')
    //             .set('Authorization', token)
    //             .end(function (err, res) {
    //                 var data = res.body;
    //                 expect(res).to.have.status(200);
    //                 done();
    //             });
    //     });
    // });
    /**
     * attempt to search for a user by userNameDisplay
     * prereq: valid userNameDisplay
     */
    describe('Retrieve user info from a valid search', function() {
        it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function(done) {
            chai.request(server)
                .get('/api/users/search/?username=' + userNameDisplay)
                .set('Authorization', token)
                .end(function (err, res) {
                    var data = res.body;
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                    expect(data).to.have.property('_id');
                    expect(data).to.have.property('userNameDisplay');
                    expect(data).to.have.property('emailAddress');
                    expect(data).to.have.property('userNameUrl');
                    expect(data).to.have.property('aclRoles');
                    done();
                });
        });
    });
    describe('Search for an unknown user', function() {
        it('should return null', function(done) {
            chai.request(server)
                .get('/api/users/search/?username=9871234876129876827638746187')
                .set('Authorization', token)
                .end(function (err, res) {
                    var data = res.body;
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                    expect(data).to.be.null;
                    done();
                });
        });
    });
});


describe('Users tests apiVer set to default (1.0.0)', function() {
    /**
     * Attempt to get data for a known user
     * prerequisites: userId exists, valid token
     */
    describe('Retrieve user info', function() {
        it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function(done) {
            chai.request(server)
                .get('/api/users/' + userId + '/?apiVer=1.0.0')
                .set('Authorization', token)
                .end(function (err, res) {
                    var data = res.body;
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                    expect(data).to.have.property('_id');
                    expect(data).to.have.property('userNameDisplay');
                    expect(data).to.have.property('emailAddress');
                    expect(data).to.have.property('userNameUrl');
                    expect(data).to.have.property('aclRoles');
                    done();
                });
        });
    });
    /**
     * Attempt to get data for an invalid user NOTE: in the current version this hangs the request
     * prereq: token valid
     */
    // describe('Retrieve user info', function() {
    //     it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function(done) {
    //         chai.request(server)
    //             .get('/api/users/8888888888888888888888')
    //             .set('Authorization', token)
    //             .end(function (err, res) {
    //                 var data = res.body;
    //                 expect(res).to.have.status(200);
    //                 done();
    //             });
    //     });
    // });
    /**
     * attempt to search for a user by userNameDisplay
     * prereq: valid userNameDisplay
     */
    describe('Retrieve user info from a valid search', function() {
        it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function(done) {
            chai.request(server)
                .get('/api/users/search/?username=' + userNameDisplay  + '/&apiVer=1.0.0')
                .set('Authorization', token)
                .end(function (err, res) {
                    var data = res.body;
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                    expect(data).to.have.property('_id');
                    expect(data).to.have.property('userNameDisplay');
                    expect(data).to.have.property('emailAddress');
                    expect(data).to.have.property('userNameUrl');
                    expect(data).to.have.property('aclRoles');
                    done();
                });
        });
    });
    describe('Search for an unknown user', function() {
        it('should return null', function(done) {
            chai.request(server)
                .get('/api/users/search/?username=9871234876129876827638746187' + '/&apiVer=1.0.0')
                .set('Authorization', token)
                .end(function (err, res) {
                    var data = res.body;
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                    expect(data).to.be.null;
                    done();
                });
        });
    });
});

