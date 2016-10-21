var chai        = require('chai');
var chaiHttp    = require('chai-http');
var host        = 'http://' + (process.env.HOST || 'localhost');
var server      = host + ":" + (process.env.PORT || 80);
var expect      = require('chai').expect;

var token;
var userId;
var userNameDisplay = 'bryceb';
var videoId = '57e8366a7b09480e3378289f';
var videoOwnerId = '56703d3b8440cc2451a06d8b';

chai.use(chaiHttp);

describe('Like API tests', function() {
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
    describe('Like tests no apiVer', function() {
        var apiVer = 'apiVer=';

        describe('Like a video', function() {
            it('should like a video', function (done) {
                chai.request(server)
                    .post('/api/video-like/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    // TODO send pure JSON instead of JSON in a string
                    .send({data:'{' +
                        '"like": {' +
                        '"videoId":"'+videoId+'",' +
                        '"userId":"'+userId+'",' +
                        '"videoOwnerId":"'+videoOwnerId+'"' +
                        '},' +
                        '"notification": {' +
                        '"notificationType":"LIKE",' +
                        '"notifiedUserId":"'+videoOwnerId+'",' +
                        '"notificationMessage":"liked your video",' +
                        '"videoId":"'+videoId+'",' +
                        '"actionUserId":"'+userId+'"' +
                        '}' +
                        '}'
                    })
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
                    .post('/api/video-like/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    // TODO send pure JSON instead of JSON in a string
                    .send({data:'{' +
                        '"like": {' +
                        '"videoId":"'+videoId+'",' +
                        '"userId":"'+userId+'",' +
                        '"videoOwnerId":"'+videoOwnerId+'"' +
                        '},' +
                        '"notification": {' +
                        '"notificationType":"LIKE",' +
                        '"notifiedUserId":"'+videoOwnerId+'",' +
                        '"notificationMessage":"liked your video",' +
                        '"videoId":"'+videoId+'",' +
                        '"actionUserId":"'+userId+'"' +
                        '}' +
                        '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'unliked');
                        done();
                    });
            });
        });
    //no apiVer end
    });
    describe('Like tests apiVer=1.0.0', function() {
        var apiVer = 'apiVer=1.0.0';
        describe('Like a video', function() {
            it('should like a video', function (done) {
                chai.request(server)
                    .post('/api/video-like/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({data:'{' +
                        '"like": {' +
                        '"videoId":"'+videoId+'",' +
                        '"userId":"'+userId+'",' +
                        '"videoOwnerId":"'+videoOwnerId+'"' +
                        '},' +
                        '"notification": {' +
                        '"notificationType":"LIKE",' +
                        '"notifiedUserId":"'+videoOwnerId+'",' +
                        '"notificationMessage":"liked your video",' +
                        '"videoId":"'+videoId+'",' +
                        '"actionUserId":"'+userId+'"' +
                        '}' +
                        '}'
                    })
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
                    .post('/api/video-like/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({data:'{' +
                        '"like": {' +
                        '"videoId":"'+videoId+'",' +
                        '"userId":"'+userId+'",' +
                        '"videoOwnerId":"'+videoOwnerId+'"' +
                        '},' +
                        '"notification": {' +
                        '"notificationType":"LIKE",' +
                        '"notifiedUserId":"'+videoOwnerId+'",' +
                        '"notificationMessage":"liked your video",' +
                        '"videoId":"'+videoId+'",' +
                        '"actionUserId":"'+userId+'"' +
                        '}' +
                        '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('status', 'unliked');
                        done();
                    });
            });
        });
    });
    describe('Like tests apiVer=2.0.0', function() {
        var apiVer = 'apiVer=2.0.0';
        describe('Like a video', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/video-like/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({data:'{' +
                        '"like": {' +
                        '"videoId":"'+videoId+'",' +
                        '"userId":"'+userId+'",' +
                        '"videoOwnerId":"'+videoOwnerId+'"' +
                        '},' +
                        '"notification": {' +
                        '"notificationType":"LIKE",' +
                        '"notifiedUserId":"'+videoOwnerId+'",' +
                        '"notificationMessage":"liked your video",' +
                        '"videoId":"'+videoId+'",' +
                        '"actionUserId":"'+userId+'"' +
                        '}' +
                        '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('un-Like a video', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/video-like/?' + apiVer)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({data:'{' +
                        '"like": {' +
                        '"videoId":"'+videoId+'",' +
                        '"userId":"'+userId+'",' +
                        '"videoOwnerId":"'+videoOwnerId+'"' +
                        '},' +
                        '"notification": {' +
                        '"notificationType":"LIKE",' +
                        '"notifiedUserId":"'+videoOwnerId+'",' +
                        '"notificationMessage":"liked your video",' +
                        '"videoId":"'+videoId+'",' +
                        '"actionUserId":"'+userId+'"' +
                        '}' +
                        '}'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
    });
});