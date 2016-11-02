var chai        = require('chai');
var chaiHttp    = require('chai-http');
var host        = 'http://' + (process.env.HOST || 'localhost');
var server      = host + ":" + (process.env.PORT || 80);
var expect      = require('chai').expect;

var token;
var userId;
var userNameDisplay = 'bryceb';
var videoId = '57e8366a7b09480e3378289f';

chai.use(chaiHttp);

describe('Notification API tests', function() {
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
                        .get('/api/users/search/?username=' + userNameDisplay)
                        .set('Authorization', token)
                        .end(function(err, res){
                            userId = res.body._id;
                            done();
                        });
                });
        });
    });
    describe('Notification tests no apiVer', function() {
        var apiVer = 'apiVer=';

        describe('Post a notification', function() {
            it('should post a notification and get plain text "OK"', function (done) {
                chai.request(server)
                    .post('/api/notifications/?' + apiVer)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                            notificationType:"LIKE",
                            notifiedUserId: userId,
                            notificationMessage: "liked your video",
                            videoId:videoId,
                            actionUserId:"56703d3b8440cc2451a06d8b"
                    })// TODO return JSON instead of plain text
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
                        done();
                    });
            });
        });
        describe('Get unseen notifications', function() {
            it('should get json with an array of the notification data', function (done) {
                chai.request(server)
                    .get('/api/notifications/?' + apiVer)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .set('Authorization', token)
                    .send({
                        user:userId
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.actionUserId;
                        expect(res.body[0]).to.have.createdDate;
                        expect(res.body[0]).to.have.notificationMessage;
                        expect(res.body[0]).to.have.notificationViewed;
                        expect(res.body[0]).to.have.notifiedUserId;
                        expect(res.body[0]).to.have._id;
                        done();
                    });
            });
        });
        describe('Mark all unseen notifications as seen', function() {
            it('should mark all unseen notification as seen, and return plain text "ok"', function (done) {
                chai.request(server)
                    .post('/api/notifications/seen/?' + apiVer)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .set('Authorization', token)
                    .send({
                        user:userId
                    })// TODO return JSON instead of plain text
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal("OK");
                        done();
                    });
            });
        });
        describe('Get all notifications', function() {
            it('should return json with notifications in the text property', function (done) {
                chai.request(server)
                    .get('/api/notifications/get-all/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.text).to.have.string('notifications');
                        done();
                    });
            });
        });
    });
    describe('Notification tests apiVer=1.0.0', function() {
        var apiVer = 'apiVer=1.0.0';
        describe('Post a notification', function() {
            it('should post a notification and get plain text "OK"', function (done) {
                chai.request(server)
                    .post('/api/notifications/?' + apiVer)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        notificationType:"LIKE",
                        notifiedUserId: userId,
                        notificationMessage: "liked your video",
                        videoId:videoId,
                        actionUserId:"56703d3b8440cc2451a06d8b"
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
        describe('Get unseen notifications', function() {
            it('should get json with an array of the notification data', function (done) {
                chai.request(server)
                    .get('/api/notifications/?' + apiVer)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .set('Authorization', token)
                    .send({
                        user:userId
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.actionUserId;
                        expect(res.body[0]).to.have.createdDate;
                        expect(res.body[0]).to.have.notificationMessage;
                        expect(res.body[0]).to.have.notificationViewed;
                        expect(res.body[0]).to.have.notifiedUserId;
                        expect(res.body[0]).to.have._id;
                        done();
                    });
            });
        });
        describe('Mark all unseen notifications as seen', function() {
            it('should mark all unseen notification as seen', function (done) {
                chai.request(server)
                    .post('/api/notifications/seen/?' + apiVer)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .set('Authorization', token)
                    .send({
                        user:userId
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
        describe('Get all notifications', function() {
            it('should return json with notifications in the text property', function (done) {
                chai.request(server)
                    .get('/api/notifications/get-all/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.text).to.have.string('notifications');
                        done();
                    });
            });
        });
    });
    describe('Notification tests apiVer=2.0.0', function() {
        var apiVer = 'apiVer=2.0.0';
        describe('Post a notification', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/notifications/?' + apiVer)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        notificationType:"LIKE",
                        notifiedUserId: userId,
                        notificationMessage: "liked your video",
                        videoId:videoId,
                        actionUserId:"56703d3b8440cc2451a06d8b"
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get unseen notifications', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/notifications/?' + apiVer)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .set('Authorization', token)
                    .send({
                        user:userId
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Mark all unseen notifications as seen', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/notifications/seen/?' + apiVer)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .set('Authorization', token)
                    .send({
                        user:userId
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get all notifications', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/notifications/get-all/' + userId + '/?' + apiVer)
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