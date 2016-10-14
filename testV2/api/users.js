var chai        = require('chai');
var chaiHttp    = require('chai-http');
var host        = 'http://' + (process.env.HOST || 'localhost');
var server      = host + ":" + (process.env.PORT || 80);
var expect      = require('chai').expect;

var user        = require('../../app/persistence/crud/users1-0-0');


var token;
var userId = '56a7473c2defb658467acb6e';
var userNameDisplay = 'bryceb';

chai.use(chaiHttp);

describe('Users API tests', function () {
    before(function (done) {
        chai.request(server)
            .post('/api/auth')
            .send({emailAddress: 'bryce.blilie@airvuz.com', password: 'bryc3b'})
            .end(function (err, res) {
                token = "Bearer " + res.text;
                done();
            });
    });
    describe('Users tests no apiVer', function() {
        /**
         * Attempt to get data for a known user
         * prerequisites: userId exists, valid token
         */
        describe('Retrieve user info', function() {
            it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function(done) {
                chai.request(server)
                    .get('/api/users/' + userId)
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
        describe('Request a password reset', function() {
            it('should return an OK', function(done) {
                this.timeout(10000);
                setTimeout(done, 10000);
                chai.request(server)
                    .post('/api/users/password-reset')
                    .send({ email: 'bryce.blilie@airvuz.com' })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        done();
                    });
            });
        });
        // describe('Change password after reset request', function() {
        //     it('should return ', function(done) {
        //         chai.request(server)
        //             .put('/api/users/password-reset')
        //             .send({ email: 'bryce.blilie@airvuz.com' })
        //             .end(function (err, res) {
        //                 expect(res).to.have.status(200);
        //                 done();
        //             });
        //     });
        // });
    });

    describe('Users tests apiVer set to default (1.0.0)', function() {
        /**
         * Attempt to get data for a known user
         * prerequisites: userId exists, valid token
         */
        var apiVer = 'apiVer=1.0.0';

        describe('Retrieve user info', function() {
            it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function(done) {
                chai.request(server)
                    .get('/api/users/' + userId + '/?' + apiVer)
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
                    .get('/api/users/search/?username=' + userNameDisplay  + '/&' + apiVer)
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
                    .get('/api/users/search/?username=9871234876129876827638746187' + '/&' + apiVer)
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

    describe('Users tests apiVer set to default (2.0.0)', function() {
        /**
         * Attempt to get data for a known user
         * prerequisites: userId exists, valid token
         */
        var apiVer = 'apiVer=2.0.0';

        describe('Retrieve user info', function() {
            it('should return 400 incorrect API Version', function(done) {
                chai.request(server)
                    .get('/api/users/' + userId + '/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res).to.be.json;
                        expect(data).to.have.property("error");
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
                    .get('/api/users/search/?username=' + userNameDisplay  + '/&' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res).to.be.json;
                        expect(data).to.have.property("error");
                        done();
                    });
            });
        });
        describe('Search for an unknown user', function() {
            it('should return null', function(done) {
                chai.request(server)
                    .get('/api/users/search/?username=9871234876129876827638746187' + '/&' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res).to.be.json;
                        expect(data).to.have.property("error");
                        done();
                    });
            });
        });
    });

});


