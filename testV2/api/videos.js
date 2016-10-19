var chai        = require('chai');
var chaiHttp    = require('chai-http');
var host        = 'http://' + (process.env.HOST || 'localhost');
var server      = host + ":" + (process.env.PORT || 80);
var expect      = require('chai').expect;

var token;
var userId;
var videoId;
var userNameDisplay = 'bryceb';

chai.use(chaiHttp);

describe('Video API tests', function () {
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
    describe('Video tests no apiVer', function () {
        /**
         * Test all video API routes using no apiVer query param
         */
        var apiVer = 'apiVer=';

        describe('Post a new video', function () {
            it('should return json with the posted fields as properties', function (done) {
                chai.request(server)
                    .post('/api/videos/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        'userId': userId,
                        'title': 'title_xxxxx',
                        'description': 'description_xxxxxx',
                        'duration': 1,
                        'isActive': true,
                        'thumbnailPath': '4ff2fcce6b32cf6ccf9fa4190ee58d5f/tn_00006.jpg',
                        'videoPath': '4ff2fcce6b32cf6ccf9fa4190ee58d5f/4ff2fcce6b32cf6ccf9fa4190ee58d5f.mp4',
                        'categories': '57e7fbbb2053680c6e89ad92',
                        'videoLocation': 'earth_xxxxx',
                        'tags': 'tagged_xxxxx'
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property("title", "title_xxxxx");
                        expect(data).to.have.property("description", "description_xxxxxx");
                        expect(data).to.have.property("duration", "1");
                        expect(res.body.isActive).to.be.true;
                        expect(data).to.have.property("videoPath", "4ff2fcce6b32cf6ccf9fa4190ee58d5f/4ff2fcce6b32cf6ccf9fa4190ee58d5f.mp4");
                        expect(data).to.have.property("thumbnailPath", "4ff2fcce6b32cf6ccf9fa4190ee58d5f/tn_00006.jpg");
                        expect(res.body.categories[0]).to.have.string("57e7fbbb2053680c6e89ad92");
                        expect(data).to.have.property("videoLocation", "earth_xxxxx");
                        expect(res.body.tags[0]).to.have.string("tagged_xxxxx");
                        videoId = res.body._id;
                        done();
                    });
            });
        });
        describe('Update the video just posted', function () {
            it('should return json with the updated values', function (done) {
                chai.request(server)
                    .put('/api/videos/' + videoId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        userId: userId,
                        title: 'updated title',
                        description: 'updated description',
                        duration: 1,
                        isActive: true,
                        thumbnailPath: '/images',
                        videoPath: '/video',
                        categories: '574f91b3b55602296def65be',
                        videoLocation: 'updated earth',
                        tags: "updated tag1, updated tag2"
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property("userId", userId);
                        expect(data).to.have.property("title", "updated title");
                        expect(data).to.have.property("description", "updated description");
                        expect(data).to.have.property("duration", "1");
                        expect(res.body.isActive).to.be.true;
                        expect(data).to.have.property("videoPath", "/video");
                        expect(data).to.have.property("thumbnailPath", "/images");
                        expect(res.body.categories[0]).to.have.string("574f91b3b55602296def65be");
                        expect(data).to.have.property("videoLocation", "updated earth");
                        expect(res.body.tags[0]).to.have.string("updated tag1, updated tag2");
                        done();
                    });
            });
        });
        describe('Search for a video using userId', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=' + userNameDisplay + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Search for a video using description', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=description' + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Search for a video using title', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=title' + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Search for a video using video location', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=location' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Search for a video using keyword', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=keyword' + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Like a video', function () {
            it('should return a status of liked', function (done) {
                chai.request(server)
                    .post('/api/video-like/?' + apiVer)
                    .send({data: '{"like":{"videoId":"57e8366a7b09480e3378289f","userId":"57e96a719ddd2b02f44f3367","videoOwnerId":"56703d3b8440cc2451a06d8b"},"notification":{"notificationType":"LIKE","notifiedUserId":"56703d3b8440cc2451a06d8b","notificationMessage":"liked your video","videoId":"57e8366a7b09480e3378289f","actionUserId":"57e96a719ddd2b02f44f3367"}}'})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('status');
                        done();
                    });
            });
        });
        describe('Report a video', function () {
            it('should return an "OK"', function (done) {
                chai.request(server)
                    .post('/api/videos/report-video/?' + apiVer)
                    .send({
                        videoId: videoId,
                        userId: userId,
                        message: "this is so offensive"
                    })
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal('OK');
                        done();
                    });
            });
        });
        describe('Video info check', function () {
            it('should return json with boolean for like and follow', function (done) {
                chai.request(server)
                    .get('/api/videos/videoinfocheck/?videoid=' + videoId + '&userid=' + userId + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('like');
                        expect(data).to.have.property('follow');
                        done();
                    });
            });
        });
        describe('Get videos for a user', function () {
            it('should return json with a data array', function (done) {
                chai.request(server)
                    .get('/api/videos/user/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('status', 'OK');
                        expect(data).to.have.property('code', 200);
                        expect(data).to.have.property('data');
                        done();
                    });
            });
        });
        describe('Get showcase videos for a user', function () {
            it('should return json with a data array', function (done) {
                chai.request(server)
                    .get('/api/videos/showcase/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        done();
                    });
            });
        });
        describe('Get top six videos for a user', function () {
            it('should return json with a data array', function (done) {
                chai.request(server)
                    .get('/api/videos/topsixvideos/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        done();
                    });
            });
        });
        describe('Get video count for a user', function () {
            it('should return json ', function (done) {
                chai.request(server)
                    .get('/api/videos/videocount/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        done();
                    });
            });
        });
        describe('Get follow count for a user', function () {
            it('should return json with a numeric value', function (done) {
                chai.request(server)
                    .get('/api/videos/followcount/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        done();
                    });
            });
        });
        describe('Get next videos', function () {
            it('should return json with an array of videos', function (done) {
                chai.request(server)
                    .get('/api/videos/nextvideos/?video=' + videoId + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data[0]).to.have.property('_id');
                        expect(data[0]).to.have.property('title');
                        expect(data[0]).to.have.property('description');
                        expect(data[0]).to.have.property('duration');
                        expect(data[0]).to.have.property('videoPath');
                        expect(data[0]).to.have.property('thumbnailPath');
                        expect(data[0]).to.have.property('videoLocation');
                        expect(data[0]).to.have.property('tags');
                        expect(data[0]).to.have.property('internalTags');
                        expect(data[0]).to.have.property('viewCount');
                        expect(data[0]).to.have.property('uploadDate');
                        expect(data[0]).to.have.property('tags');
                        expect(data[0]).to.have.property('recordDate');
                        expect(data[0]).to.have.property('openGraphCacheDate');
                        expect(data[0]).to.have.property('likeCount');
                        expect(data[0]).to.have.property('isActive');
                        expect(data[0]).to.have.property('commentCount');
                        expect(data[0]).to.have.property('categories');
                        expect(data[0]).to.have.property('allowRatings');
                        expect(data[0]).to.have.property('allowComments');
                        expect(data[0]).to.have.property('__v');
                        expect(data[0]).to.have.property('fullTitle');
                        expect(data[0]).to.have.property('displayDate');
                        done();
                    });
            });
        });
        describe('Get a video by valid videoId', function () {
            it('should return json with userId, title, and description properties', function (done) {
                chai.request(server)
                    .get('/api/videos/' + videoId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('userId');
                        expect(data).to.have.property('title');
                        expect(data).to.have.property('description');
                        done();
                    });
            });
        });
        describe('Get video owner profile', function () {
            it('should return json data containing user email, profile pic, usernameurl, first and last name', function(done) {
                chai.request(server)
                    .get('/api/video/videoownerprofile/' + userId + '/?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body._id).to.equal(userId);
                        expect(res.body).to.have.property('emailAddress');
                        expect(res.body).to.have.property('userNameDisplay');
                        expect(res.body).to.have.property('profilePicture');
                        expect(res.body).to.have.property('userNameUrl');
                        expect(res.body).to.have.property('autoPlay');
                        expect(res.body).to.have.property('aclRoles');
                        expect(res.body).to.have.property('lastName');
                        expect(res.body).to.have.property('firstName');
                        expect(res.body).to.have.property('isExternalLink');
                        done();
                    });
            });
        });
        describe('Get comments for a video', function() {
            it('should return json data', function(done) {
                chai.request(server)
                    .get('/api/videos/videocomments/' + videoId + '/?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        if (res.body == '') {
                            // There were no comments on this video
                            console.log("no comments");
                            done();
                        } else {
                            // The video id needs to match the videoId param to help ensure the right data was returned
                            expect(res.body.videoId).to.equal(videoId);
                            expect(res.body).to.have.property('_id');
                            expect(res.body).to.have.property('comment');
                            expect(res.body).to.have.property('isVisible');
                            expect(res.body).to.have.property('userId');
                            expect(res.body).to.have.property('userId');
                            expect(res.body.userId).to.have.property('city');
                            expect(res.body.userId).to.have.property('country');
                            expect(res.body.userId).to.have.property('personalInfo');
                            expect(res.body.userId).to.have.property('aclRoles');
                            expect(res.body.userId).to.have.property('allowDonation');
                            expect(res.body.userId).to.have.property('allowHire');
                            expect(res.body.userId).to.have.property('coverPicture');
                            expect(res.body.userId).to.have.property('donationUrl');
                            expect(res.body.userId).to.have.property('emailAddress');
                            expect(res.body.userId).to.have.property('firstName');
                            expect(res.body.userId).to.have.property('lastName');
                            expect(res.body.userId).to.have.property('profilePicture');
                            expect(res.body.userId).to.have.property('userNameDisplay');
                            expect(res.body.userId).to.have.property('userNameUrl');
                            expect(res.body.userId).to.have.property('accountCreatedDate');
                            expect(res.body.userId).to.have.property('password');
                            expect(res.body.userId).to.have.property('status');
                            expect(res.body.userId).to.have.property('autoPlay');
                            expect(res.body.userId).to.have.property('lastLoginDate');
                            expect(res.body.userId).to.have.property('socialMediaLinks');
                            expect(res.body.userId).to.have.property('version');
                            expect(res.body).to.have.property('replyDepth');
                            expect(res.body).to.have.property('replyCount');
                            expect(res.body).to.have.property('commentSortOrder');
                            expect(res.body).to.have.property('commentCreatedDate');
                            expect(res.body).to.have.property('commentDisplayDate');
                            expect(res.body).to.have.property('showReplies');
                            done();
                        };
                    });
            });
        });
        describe('Delete the posted video', function () {
            it('should delete the video and return plain text "ok"', function (done) {
                chai.request(server)
                    .delete('/api/videos/' + videoId + '/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(res.text).to.equal('OK');
                        done();
                    });
            });
        });
    });
    describe('Video tests apiVer=1.0.0', function () {
        /**
         * Test all video API routes using no apiVer query param
         */
        var apiVer = 'apiVer=1.0.0';

        describe('Post a new video', function () {
            it('should return json with the posted fields as properties', function (done) {
                chai.request(server)
                    .post('/api/videos/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        'userId': userId,
                        'title': 'title_xxxxx',
                        'description': 'description_xxxxxx',
                        'duration': 1,
                        'isActive': true,
                        'thumbnailPath': '4ff2fcce6b32cf6ccf9fa4190ee58d5f/tn_00006.jpg',
                        'videoPath': '4ff2fcce6b32cf6ccf9fa4190ee58d5f/4ff2fcce6b32cf6ccf9fa4190ee58d5f.mp4',
                        'categories': '57e7fbbb2053680c6e89ad92',
                        'videoLocation': 'earth_xxxxx',
                        'tags': 'tagged_xxxxx'
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property("title", "title_xxxxx");
                        expect(data).to.have.property("description", "description_xxxxxx");
                        expect(data).to.have.property("duration", "1");
                        expect(res.body.isActive).to.be.true;
                        expect(data).to.have.property("videoPath", "4ff2fcce6b32cf6ccf9fa4190ee58d5f/4ff2fcce6b32cf6ccf9fa4190ee58d5f.mp4");
                        expect(data).to.have.property("thumbnailPath", "4ff2fcce6b32cf6ccf9fa4190ee58d5f/tn_00006.jpg");
                        expect(res.body.categories[0]).to.have.string("57e7fbbb2053680c6e89ad92");
                        expect(data).to.have.property("videoLocation", "earth_xxxxx");
                        expect(res.body.tags[0]).to.have.string("tagged_xxxxx");
                        videoId = res.body._id;
                        done();
                    });
            });
        });
        describe('Update the video just posted', function () {
            it('should return json with the updated values', function (done) {
                chai.request(server)
                    .put('/api/videos/' + videoId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        userId: userId,
                        title: 'updated title',
                        description: 'updated description',
                        duration: 1,
                        isActive: true,
                        thumbnailPath: '/images',
                        videoPath: '/video',
                        categories: '574f91b3b55602296def65be',
                        videoLocation: 'updated earth',
                        tags: "updated tag1, updated tag2"
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property("userId", userId);
                        expect(data).to.have.property("title", "updated title");
                        expect(data).to.have.property("description", "updated description");
                        expect(data).to.have.property("duration", "1");
                        expect(res.body.isActive).to.be.true;
                        expect(data).to.have.property("videoPath", "/video");
                        expect(data).to.have.property("thumbnailPath", "/images");
                        expect(res.body.categories[0]).to.have.string("574f91b3b55602296def65be");
                        expect(data).to.have.property("videoLocation", "updated earth");
                        expect(res.body.tags[0]).to.have.string("updated tag1, updated tag2");
                        done();
                    });
            });
        });
        describe('Search for a video using userId', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=' + userNameDisplay + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Search for a video using description', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=description' + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Search for a video using title', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=title' + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Search for a video using video location', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=location' + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Search for a video using keyword', function () {
            it('should return JSON list of videos the user has uploaded', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=keyword' + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('videos');
                        done();
                    });
            });
        });
        describe('Like a video', function () {
            it('should return a status of liked', function (done) {
                chai.request(server)
                    .post('/api/video-like/?' + apiVer)
                    .send({data: '{"like":{"videoId":"57e8366a7b09480e3378289f","userId":"57e96a719ddd2b02f44f3367","videoOwnerId":"56703d3b8440cc2451a06d8b"},"notification":{"notificationType":"LIKE","notifiedUserId":"56703d3b8440cc2451a06d8b","notificationMessage":"liked your video","videoId":"57e8366a7b09480e3378289f","actionUserId":"57e96a719ddd2b02f44f3367"}}'})
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('status');
                        done();
                    });
            });
        });
        describe('Report a video', function () {
            it('should return an "OK"', function (done) {
                chai.request(server)
                    .post('/api/videos/report-video/?' + apiVer)
                    .send({
                        videoId: videoId,
                        userId: userId,
                        message: "this is so offensive"
                    })
                    .end(function (err, res) {
                        var data = res.text;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(data).to.equal('OK');
                        done();
                    });
            });
        });
        describe('Video info check', function () {
            it('should return json with boolean for like and follow', function (done) {
                chai.request(server)
                    .get('/api/videos/videoinfocheck/?videoid=' + videoId + '/&userid=' + userId + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('like');
                        expect(data).to.have.property('follow');
                        done();
                    });
            });
        });
        describe('Get videos for a user', function () {
            it('should return json with a data array', function (done) {
                chai.request(server)
                    .get('/api/videos/user/' + userId + '/?' +apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('status', 'OK');
                        expect(data).to.have.property('code', 200);
                        expect(data).to.have.property('data');
                        done();
                    });
            });
        });
        describe('Get showcase videos for a user', function () {
            it('should return json with a data array', function (done) {
                chai.request(server)
                    .get('/api/videos/showcase/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        done();
                    });
            });
        });
        describe('Get top six videos for a user', function () {
            it('should return json with a data array', function (done) {
                chai.request(server)
                    .get('/api/videos/topsixvideos/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        done();
                    });
            });
        });
        describe('Get video count for a user', function () {
            it('should return json ', function (done) {
                chai.request(server)
                    .get('/api/videos/videocount/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        done();
                    });
            });
        });
        describe('Get follow count for a user', function () {
            it('should return json with a numeric value', function (done) {
                chai.request(server)
                    .get('/api/videos/followcount/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        done();
                    });
            });
        });
        describe('Get next videos', function () {
            it('should return json with an array of videos', function (done) {
                chai.request(server)
                    .get('/api/videos/nextvideos/?video=' + videoId + '&' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data[0]).to.have.property('_id');
                        expect(data[0]).to.have.property('title');
                        expect(data[0]).to.have.property('description');
                        expect(data[0]).to.have.property('duration');
                        expect(data[0]).to.have.property('videoPath');
                        expect(data[0]).to.have.property('thumbnailPath');
                        expect(data[0]).to.have.property('videoLocation');
                        expect(data[0]).to.have.property('tags');
                        expect(data[0]).to.have.property('internalTags');
                        expect(data[0]).to.have.property('viewCount');
                        expect(data[0]).to.have.property('uploadDate');
                        expect(data[0]).to.have.property('tags');
                        expect(data[0]).to.have.property('recordDate');
                        expect(data[0]).to.have.property('openGraphCacheDate');
                        expect(data[0]).to.have.property('likeCount');
                        expect(data[0]).to.have.property('isActive');
                        expect(data[0]).to.have.property('commentCount');
                        expect(data[0]).to.have.property('categories');
                        expect(data[0]).to.have.property('allowRatings');
                        expect(data[0]).to.have.property('allowComments');
                        expect(data[0]).to.have.property('__v');
                        expect(data[0]).to.have.property('fullTitle');
                        expect(data[0]).to.have.property('displayDate');
                        done();
                    });
            });
        });
        describe('Get a video by valid videoId', function () {
            it('should return json with userId, title, and description properties', function (done) {
                chai.request(server)
                    .get('/api/videos/' + videoId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(data).to.have.property('userId');
                        expect(data).to.have.property('title');
                        expect(data).to.have.property('description');
                        done();
                    });
            });
        });
        describe('Get video owner profile', function () {
            it('should return json data containing user email, profile pic, usernameurl, first and last name', function(done) {
                chai.request(server)
                    .get('/api/video/videoownerprofile/' + userId + '/?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body._id).to.equal(userId);
                        expect(res.body).to.have.property('emailAddress');
                        expect(res.body).to.have.property('userNameDisplay');
                        expect(res.body).to.have.property('profilePicture');
                        expect(res.body).to.have.property('userNameUrl');
                        expect(res.body).to.have.property('autoPlay');
                        expect(res.body).to.have.property('aclRoles');
                        expect(res.body).to.have.property('lastName');
                        expect(res.body).to.have.property('firstName');
                        expect(res.body).to.have.property('isExternalLink');
                        done();
                    });
            });
        });
        describe('Get comments for a video', function() {
            it('should return json data', function(done) {
                chai.request(server)
                    .get('/api/videos/videocomments/' + videoId + '/?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        if (res.body == '') {
                            // There were no comments on this video
                            console.log("no comments");
                            done();
                        } else {
                            // The video id needs to match the videoId param to help ensure the right data was returned
                            expect(res.body.videoId).to.equal(videoId);
                            expect(res.body).to.have.property('_id');
                            expect(res.body).to.have.property('comment');
                            expect(res.body).to.have.property('isVisible');
                            expect(res.body).to.have.property('userId');
                            expect(res.body).to.have.property('userId');
                            expect(res.body.userId).to.have.property('city');
                            expect(res.body.userId).to.have.property('country');
                            expect(res.body.userId).to.have.property('personalInfo');
                            expect(res.body.userId).to.have.property('aclRoles');
                            expect(res.body.userId).to.have.property('allowDonation');
                            expect(res.body.userId).to.have.property('allowHire');
                            expect(res.body.userId).to.have.property('coverPicture');
                            expect(res.body.userId).to.have.property('donationUrl');
                            expect(res.body.userId).to.have.property('emailAddress');
                            expect(res.body.userId).to.have.property('firstName');
                            expect(res.body.userId).to.have.property('lastName');
                            expect(res.body.userId).to.have.property('profilePicture');
                            expect(res.body.userId).to.have.property('userNameDisplay');
                            expect(res.body.userId).to.have.property('userNameUrl');
                            expect(res.body.userId).to.have.property('accountCreatedDate');
                            expect(res.body.userId).to.have.property('password');
                            expect(res.body.userId).to.have.property('status');
                            expect(res.body.userId).to.have.property('autoPlay');
                            expect(res.body.userId).to.have.property('lastLoginDate');
                            expect(res.body.userId).to.have.property('socialMediaLinks');
                            expect(res.body.userId).to.have.property('version');
                            expect(res.body).to.have.property('replyDepth');
                            expect(res.body).to.have.property('replyCount');
                            expect(res.body).to.have.property('commentSortOrder');
                            expect(res.body).to.have.property('commentCreatedDate');
                            expect(res.body).to.have.property('commentDisplayDate');
                            expect(res.body).to.have.property('showReplies');
                            done();
                        };
                    });
            });
        });
        describe('Delete the posted video', function () {
            it('should delete the video and return plain text "ok"', function (done) {
                chai.request(server)
                    .delete('/api/videos/' + videoId + '/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(res.text).to.equal('OK');
                        done();
                    });
            });
        });
    });
    describe('Video tests apiVer=2.0.0', function () {
        /**
         * Test all video API routes using no apiVer query param
         */
        var apiVer = 'apiVer=2.0.0';

        describe('Post a new video', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/videos/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        'userId': userId,
                        'title': 'title_xxxxx',
                        'description': 'description_xxxxxx',
                        'duration': 1,
                        'isActive': true,
                        'thumbnailPath': '4ff2fcce6b32cf6ccf9fa4190ee58d5f/tn_00006.jpg',
                        'videoPath': '4ff2fcce6b32cf6ccf9fa4190ee58d5f/4ff2fcce6b32cf6ccf9fa4190ee58d5f.mp4',
                        'categories': '57e7fbbb2053680c6e89ad92',
                        'videoLocation': 'earth_xxxxx',
                        'tags': 'tagged_xxxxx'
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Update the video just posted', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .put('/api/videos/' + videoId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        userId: userId,
                        title: 'updated title',
                        description: 'updated description',
                        duration: 1,
                        isActive: true,
                        thumbnailPath: '/images',
                        videoPath: '/video',
                        categories: '574f91b3b55602296def65be',
                        videoLocation: 'updated earth',
                        tags: "updated tag1, updated tag2"
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Search for a video using userId', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=' + userNameDisplay + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Search for a video using description', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=description' + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Search for a video using title', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=title' + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Search for a video using video location', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=location' + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Search for a video using keyword', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/search/?q=keyword' + '&' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Like a video', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/video-like/?' + apiVer)
                    .send({data: '{"like":{"videoId":"57e8366a7b09480e3378289f","userId":"57e96a719ddd2b02f44f3367","videoOwnerId":"56703d3b8440cc2451a06d8b"},"notification":{"notificationType":"LIKE","notifiedUserId":"56703d3b8440cc2451a06d8b","notificationMessage":"liked your video","videoId":"57e8366a7b09480e3378289f","actionUserId":"57e96a719ddd2b02f44f3367"}}'})
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Report a video', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/videos/report-video/?' + apiVer)
                    .send({
                        videoId: videoId,
                        userId: userId,
                        message: "this is so offensive"
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Video info check', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/videoinfocheck/?' + videoId + '&' +apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get videos for a user', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/user/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get showcase videos for a user', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/showcase/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get top six videos for a user', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/topsixvideos/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get video count for a user', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/videocount/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get follow count for a user', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/followcount/' + userId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get next videos', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/nextvideos/?video=' + videoId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get a video by valid videoId', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/videos/' + videoId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get video owner profile', function () {
            it('should a 400 and invalid api version json', function(done) {
                chai.request(server)
                    .get('/api/video/videoownerprofile/' + userId + '/?' +apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get comments for a video', function() {
            it('should a 400 and invalid api version json', function(done) {
                chai.request(server)
                    .get('/api/videos/videocomments/' + videoId + '/?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Delete the posted video', function () {
            it('should a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .delete('/api/videos/' + videoId + '/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
    });
});