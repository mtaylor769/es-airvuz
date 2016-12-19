var chai        = require('chai');
var chaiHttp    = require('chai-http');
var server      = 'http://' + process.env.NODE_TEST_ENV;
var expect      = require('chai').expect;

var testEmailAddress = process.env.TEST_EMAIL;
var userNameDisplay = process.env.TEST_USER;
var testPassword = process.env.TEST_PWD;

var token;
var userId;
var videoId = '57e8366a7b09480e3378289f';

chai.use(chaiHttp);

describe('Like API tests', function() {
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
//--------------------------------------------------------------------------------------------------------------------->
    describe('Like tests no apiVer', function() {
        var apiVer = 'apiVer=';

        describe('Like a video', function() {
            it('should like a video', function (done) {
                chai.request(server)
                    .post('/api/videos/' + videoId + '/like?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'liked');
                        done();
                    });
            });
        });
        describe('Un-Like a video', function() {
            it('should like a video', function (done) {
                chai.request(server)
                    .post('/api/videos/' + videoId + '/like?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'unliked');
                        done();
                    });
            });
        });
    });
//--------------------------------------------------------------------------------------------------------------------->
    describe('Like tests apiVer=1.0.0', function() {
        var apiVer = 'apiVer=1.0.0';
        describe('Like a video', function() {
            it('should like a video', function (done) {
                chai.request(server)
                    .post('/api/videos/' + videoId + '/like?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'liked');
                        done();
                    });
            });
        });
        describe('Un-Like a video', function() {
            it('should like a video', function (done) {
                chai.request(server)
                    .post('/api/videos/' + videoId + '/like?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'unliked');
                        done();
                    });
            });
        });
    });
//--------------------------------------------------------------------------------------------------------------------->
    describe('Like tests apiVer=2.0.0', function() {
        var apiVer = 'apiVer=2.0.0';
        describe('Like a video', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/videos/' + videoId + '/like?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version");
                        done();
                    });
            });
        });
        describe('un-Like a video', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/videos/' + videoId + '/like?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version");
                        done();
                    });
            });
        });
    });
});