var chai        = require('chai');
var chaiHttp    = require('chai-http');
var host        = 'http://' + (process.env.HOST || 'localhost');
var server      = host + ":" + (process.env.PORT || 80);
var expect      = require('chai').expect;

var token;
var userId;
var userNameDisplay = 'bryceb';
var followingUserId = '57b248b28f6b2e883860fd6f';

chai.use(chaiHttp);

describe('Follow API tests', function() {
    before(function (done) {
        /**
         * Obtain a valid token using local login, then get the userid by searching
         */
        describe('get a token', function() {
            chai.request(server)
                .post('/api/auth')
                .send({emailAddress: 'bryce.blilie@airvuz.com', password: 'bryc3b'})
                .then(function (res) {
                    return token = "Bearer " + res.text;
                })
                .then(function(token) {
                    chai.request(server)
                        .et('/api/users?username=' + userNameDisplay)
                        .set('Authorization', token)
                        .end(function(err, res){
                            userId = res.body._id;
                            done();
                        });
                });
        });
    });
    describe('Follow tests no apiVer', function() {
        var apiVer = 'apiVer=';
        describe('Check following a user', function() {
            it('should return follow status', function (done) {
                chai.request(server)
                    .post('/api/follow/check?' + apiVer)
                    .set('Content-Type', 'application/json; charset=UTF-8')
                    .send({ followingUserId: followingUserId, userId: userId })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status');
                        done();
                    });
            });
        });
        describe('Follow a user', function() {
            it('should follow a user', function (done) {
                chai.request(server)
                    .post('/api/follow/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    // TODO send pure JSON instead of JSON in a string
                    .send({data:'{' +
                    '"follow": {' +
                    '"userId":"'+userId+'",' +
                    '"followingUserId":"'+followingUserId+'"' +
                    '},' +
                    '"notification": {' +
                    '"notificationType":"FOLLOW",' +
                    '"notificationMessage":"started following you",' +
                    '"actionUserId":"'+userId+'",' +
                    '"notifiedUserId":"'+followingUserId+'"' +
                    '}' +
                    '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'followed');
                        done();
                    });
            });
        });
        describe('Un-Follow a user', function() {
            it('should unfollow a user', function(done) {
                chai.request(server)
                    .post('/api/follow/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    // TODO send pure JSON instead of JSON in a string
                    .send({data:'{' +
                    '"follow": {' +
                    '"userId":"'+userId+'",' +
                    '"followingUserId":"'+followingUserId+'"' +
                    '},' +
                    '"notification": {' +
                    '"notificationType":"FOLLOW",' +
                    '"notificationMessage":"started following you",' +
                    '"actionUserId":"'+userId+'",' +
                    '"notifiedUserId":"'+followingUserId+'"' +
                    '}' +
                    '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'unfollowed');
                        done();
                    });
            });
        });
        describe('Get a users followers', function() {
            it('should return json with follower data', function(done) {
                chai.request(server)
                    .get('/api/follow/get-followers/?userId=' + userId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('_id')
                        expect(res.body[0]).to.have.property('userId')
                        expect(res.body[0]).to.have.property('followingUserId')
                        expect(res.body[0]).to.have.property('createdDate')
                        done();
                    });
            });
        });
        describe('Get followed users for a user', function() {
            it('should return json with followed users', function(done) {
                chai.request(server)
                    .get('/api/follow/get-following/?userId=' + userId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('_id')
                        expect(res.body[0]).to.have.property('userId')
                        expect(res.body[0]).to.have.property('followingUserId')
                        expect(res.body[0]).to.have.property('createdDate')
                        done();
                    });
            });
        });
    });
    describe('Follow tests apiVer=1.0.0', function() {
        var apiVer = 'apiVer=1.0.0';
        describe('Check following a user', function () {
            it('should return follow status', function (done) {
                chai.request(server)
                    .post('/api/follow/check?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .send({followingUserId: followingUserId, userId: userId})
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status');
                        done();
                    });
            });
        });
        describe('Follow a user', function () {
            it('should follow a user', function (done) {
                chai.request(server)
                    .post('/api/follow/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({data:'{' +
                    '"follow": {' +
                    '"userId":"'+userId+'",' +
                    '"followingUserId":"'+followingUserId+'"' +
                    '},' +
                    '"notification": {' +
                    '"notificationType":"FOLLOW",' +
                    '"notificationMessage":"started following you",' +
                    '"actionUserId":"'+userId+'",' +
                    '"notifiedUserId":"'+followingUserId+'"' +
                    '}' +
                    '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'followed');
                        done();
                    });
            });
        });
        describe('Un-Follow a user', function () {
            it('should un-follow a user', function (done) {
                chai.request(server)
                    .post('/api/follow/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({data:'{' +
                    '"follow": {' +
                    '"userId":"'+userId+'",' +
                    '"followingUserId":"'+followingUserId+'"' +
                    '},' +
                    '"notification": {' +
                    '"notificationType":"FOLLOW",' +
                    '"notificationMessage":"started following you",' +
                    '"actionUserId":"'+userId+'",' +
                    '"notifiedUserId":"'+followingUserId+'"' +
                    '}' +
                    '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'unfollowed');
                        done();
                    });
            });
        });
        describe('Get a users followers', function () {
            it('should return json with follower data', function (done) {
                chai.request(server)
                    .get('/api/follow/get-followers/?userId=' + userId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('_id')
                        expect(res.body[0]).to.have.property('userId')
                        expect(res.body[0]).to.have.property('followingUserId')
                        expect(res.body[0]).to.have.property('createdDate')
                        done();
                    });
            });
        });
        describe('Get followed users for a user', function () {
            it('should return json with followed users', function (done) {
                chai.request(server)
                    .get('/api/follow/get-following/?userId=' + userId + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('_id')
                        expect(res.body[0]).to.have.property('userId')
                        expect(res.body[0]).to.have.property('followingUserId')
                        expect(res.body[0]).to.have.property('createdDate')
                        done();
                    });
            });
        });
    });
    describe('Follow tests apiVer=2.0.0', function() {
        var apiVer = 'apiVer=2.0.0';
        describe('Check following a user', function () {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/follow/check?' + apiVer)
                    .set('Content-Type', 'application/json; charset=UTF-8')
                    .send({followingUserId: followingUserId, userId: userId})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Follow a user', function () {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/follow/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({data:'{' +
                    '"follow": {' +
                    '"userId":"'+userId+'",' +
                    '"followingUserId":"'+followingUserId+'"' +
                    '},' +
                    '"notification": {' +
                    '"notificationType":"FOLLOW",' +
                    '"notificationMessage":"started following you",' +
                    '"actionUserId":"'+userId+'",' +
                    '"notifiedUserId":"'+followingUserId+'"' +
                    '}' +
                    '}'
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Un-Follow a user', function () {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/follow/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({data:'{' +
                    '"follow": {' +
                    '"userId":"'+userId+'",' +
                    '"followingUserId":"'+followingUserId+'"' +
                    '},' +
                    '"notification": {' +
                    '"notificationType":"FOLLOW",' +
                    '"notificationMessage":"started following you",' +
                    '"actionUserId":"'+userId+'",' +
                    '"notifiedUserId":"'+followingUserId+'"' +
                    '}' +
                    '}'
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get a users followers', function () {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/follow/get-followers/?userId=' + userId + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get followed users for a user', function () {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/follow/get-following/?userId=' + userId + '&' + apiVer)
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