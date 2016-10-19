var chai = require('chai');
var chaiHttp = require('chai-http');
var host = 'http://' + (process.env.HOST || 'localhost');
var server = host + ":" + (process.env.PORT || 80);
var expect = require('chai').expect;

var token;
var userId;
var userNameDisplay = 'bryceb';

chai.use(chaiHttp);

describe('Users API tests', function () {
    before(function (done) {
        describe('get a token', function () {
            /**
             * Login with valid username and password
             */
            chai.request(server)
                .post('/api/auth')
                .send({emailAddress: 'bryce.blilie@airvuz.com', password: 'bryc3b'})
                .then(function (res) {
                    return token = "Bearer " + res.text;
                })
                /**
                 * search for the user just logged in with to get userID
                 */
                .then(function (token) {
                    chai.request(server)
                        .get('/api/users/search/?username=' + userNameDisplay)
                        .set('Authorization', token)
                        .end(function (err, res) {
                            userId = res.body._id;
                            done();
                        });
                });
        });
    });
    describe('Users tests no apiVer', function () {
        /**
         * Attempt to get data for a known user
         * prerequisites: userId exists, valid token
         */

        var apiVer = '';
        describe('Retrieve user info', function () {
            it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function (done) {
                chai.request(server)
                    .get('/api/users/' + userId + apiVer)
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
        describe('Retrieve user info from a valid search', function () {
            it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function (done) {
                chai.request(server)
                    .get('/api/users/search/?username=' + userNameDisplay + apiVer)
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
        describe('Search for an unknown user', function () {
            it('should return null', function (done) {
                chai.request(server)
                    .get('/api/users/search/?username=9871234876129876827638746187' + apiVer)
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
        describe('Request a password reset', function () {
            it('should return an OK within 3 seconds', function (done) {
                //this.timeout(3000);
                //setTimeout(done, 3000);
                chai.request(server)
                    .post('/api/users/password-reset' + apiVer)
                    .send({email: 'bryce.blilie@airvuz.com'})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
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
        describe('Requst a hire me', function () {
            it('should return OK and send an email', function (done) {
                //this.timeout(3000);
                //setTimeout(done, 3000);
                chai.request(server)
                    .post('/api/users/hireme' + apiVer)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', token)
                    .send({
                        name: 'bryce',
                        email: 'bryce.blilie@airvuz.com',
                        message: 'message text',
                        profileUser: {emailAddress: 'bryce.blilie@airvuz.com'}
                    })
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
                        done();
                    });
            });
        });
        describe('Follow a user', function () {
            it('should return JSON indicating followed if user was not previously followed and unfollowed if vice-versa', function (done) {
                chai.request(server)
                    .post('/api/follow' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({data: '{"follow":{"userId":"57e96ae61ef82b3db949d2a8", "followingUserId":"56d9fb7ae79075c65132d1c4"},"notification":{"notificationType":"FOLLOW","notificationMessage":"started following you","actionUserId":"57e96ae61ef82b3db949d2a8","notifiedUserId":"56d9fb7ae79075c65132d1c4"}}'})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('status');
                        done();
                    });
            });
        });
        describe('Send a contact us message', function () {
            it('should return plain text "ok"', function (done) {
                chai.request(server)
                    .post('/api/users/contact-us' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({contactUsMessage: 'testing api', contactingUser: '57e96ae61ef82b3db949d2a8'})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal('OK');
                        done();
                    });
            });
        });
        describe('Update "ramputty8@gmail.com" status to suspended', function () {
            it('should return 400 unauthorized', function (done) {
                chai.request(server)
                    .put('/api/users/56a7473c2defb658467acb6e/status' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({status: 'suspended'})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(401);
                        expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
                        expect(data).to.equal('you are not allowed to update a users status');
                        done();
                    });
            });
        });
        describe('Request a confirmation email be re-sent', function () {
            it('should re-send a users confirmation email', function (done) {
                chai.request(server)
                    .post('/api/users/resend-confirmation' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({emailAddress: 'bryce.blilie@airvuz.com'})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal('OK');
                        done();
                    });
            });
        });
    });

    describe('Users tests apiVer set to default (1.0.0)', function () {
        /**
         * Attempt to get data for a known user
         * prerequisites: userId exists, valid token
         */
        var apiVer = 'apiVer=1.0.0';

        describe('Retrieve user info', function () {
            it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function (done) {
                chai.request(server)
                    .get('/api/users/' + userId + '/?' + apiVer)
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
        describe('Retrieve user info from a valid search', function () {
            it('should return user _id, userNameDisplay, emailAddress, userNameUrl, aclRoles', function (done) {
                chai.request(server)
                    .get('/api/users/search/?username=' + userNameDisplay + '/&' + apiVer)
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
        describe('Search for an unknown user', function () {
            it('should return null', function (done) {
                chai.request(server)
                    .get('/api/users/search/?username=9871234876129876827638746187/&' + apiVer)
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
        describe('Request a password reset', function () {
            it('should return an OK within 3 seconds', function (done) {
                //this.timeout(3000);
                //setTimeout(done, 3000);
                chai.request(server)
                    .post('/api/users/password-reset/?' + apiVer)
                    .send({email: 'bryce.blilie@airvuz.com'})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
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
        describe('Requst a hire me', function () {
            it('should return OK and send an email', function (done) {
                chai.request(server)
                    .post('/api/users/hireme/?' + apiVer)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', token)
                    .send({
                        name: 'bryce',
                        email: 'bryce.blilie@airvuz.com',
                        message: 'message text',
                        profileUser: {emailAddress: 'bblilie@hotmail.com'}
                    })
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
                        done();
                    });
            });
        });
        describe('Follow a user', function () {
            it('should return JSON indicating followed if user was not previously followed and unfollowed if vice-versa', function (done) {
                chai.request(server)
                    .post('/api/follow/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({data: '{"follow":{"userId":"57e96ae61ef82b3db949d2a8", "followingUserId":"56d9fb7ae79075c65132d1c4"},"notification":{"notificationType":"FOLLOW","notificationMessage":"started following you","actionUserId":"57e96ae61ef82b3db949d2a8","notifiedUserId":"56d9fb7ae79075c65132d1c4"}}'})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('status');
                        done();
                    });
            });
        });
        describe('Send a contact us message', function () {
            it('should return plain text "ok"', function (done) {
                this.timeout(3000);
                setTimeout(done, 3000);
                chai.request(server)
                    .post('/api/users/contact-us/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({contactUsMessage: 'testing api', contactingUser: '57e96ae61ef82b3db949d2a8'})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal('OK');
                        done();
                    });
            });
        });
        describe('Update "ramputty8@gmail.com" status to suspended', function () {
            it('should return 401 unauthorized', function (done) {
                chai.request(server)
                    .put('/api/users/56a7473c2defb658467acb6e/status/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({status: 'suspended'})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(401);
                        expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
                        expect(data).to.equal('you are not allowed to update a users status');
                        done();
                    });
            });
        });
        describe('Request a confirmation email be re-sent', function () {
            it('should re-send a users confirmation email', function (done) {
                chai.request(server)
                    .post('/api/users/resend-confirmation/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({emailAddress: 'bryce.blilie@airvuz.com'})
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal('OK');
                        done();
                    });
            });
        });
    });

    describe('Users tests apiVer set to default (2.0.0)', function () {
        /**
         * Attempt to get data for a known user
         * prerequisites: userId exists, valid token
         */
        var apiVer = 'apiVer=2.0.0';

        describe('Retrieve user info', function () {
            it('should return 400', function (done) {
                chai.request(server)
                    .get('/api/users/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
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
        describe('Retrieve user info from a valid search', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/users/search/?username=' + userNameDisplay + '/&' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Search for an unknown user', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/users/search/?username=9871234876129876827638746187/&' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Request a password reset', function () {
            it('should a 400 and invalid api version json', function (done) {
                this.timeout(3000);
                setTimeout(done, 3000);
                chai.request(server)
                    .post('/api/users/password-reset/?' + apiVer)
                    .send({email: 'bryce.blilie@airvuz.com'})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Requst a hire me', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/users/hireme/?' + apiVer)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', token)
                    .send({
                        name: 'bryce',
                        email: 'bryce.blilie@airvuz.com',
                        message: 'message text',
                        profileUser: {emailAddress: 'bblilie@hotmail.com'}
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Follow a user', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/follow/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({data: '{"follow":{"userId":"57e96ae61ef82b3db949d2a8", "followingUserId":"56d9fb7ae79075c65132d1c4"},"notification":{"notificationType":"FOLLOW","notificationMessage":"started following you","actionUserId":"57e96ae61ef82b3db949d2a8","notifiedUserId":"56d9fb7ae79075c65132d1c4"}}'})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Send a contact us message', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/users/contact-us/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({contactUsMessage: 'testing api', contactingUser: '57e96ae61ef82b3db949d2a8'})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Update "ramputty8@gmail.com" status to suspended', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .put('/api/users/56a7473c2defb658467acb6e/status/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({status: 'suspended'})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Request a confirmation email be re-sent', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/users/resend-confirmation/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({emailAddress: 'bryce.blilie@airvuz.com'})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
    });

});


