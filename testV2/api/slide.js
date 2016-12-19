var chai        = require('chai');
var chaiHttp    = require('chai-http');
var server      = 'http://' + process.env.NODE_TEST_ENV;
var expect      = require('chai').expect;

var testEmailAddress = process.env.TEST_EMAIL;
var userNameDisplay = process.env.TEST_USER;
var testPassword = process.env.TEST_PWD;

var token;
var userId;
var videoId = '57e8366a7b09480e3378289f'; //update to a video in local environment
var slideId;

chai.use(chaiHttp);

describe('Slide API tests', function() {
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
    describe('Slide test no apiVer', function() {
        var apiVer = 'apiVer=';
        describe('Post a slide', function() {
            it('should return json containing the slide data just submitted', function(done) {
                chai.request(server)
                    .post('/api/slide?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        name: 'Test Slide',
                        imagePath: 'test_image_path.jpg',
                        imageAlt: 'image alt',
                        video: videoId,
                        description: 'Test Description'
                    })
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('name', 'Test Slide');
                        expect(res.body).to.have.property('imagePath', 'test_image_path.jpg');
                        expect(res.body).to.have.property('imageAlt', 'image alt');
                        expect(res.body).to.have.property('video', videoId);
                        expect(res.body).to.have.property('description', 'Test Description');
                        slideId = res.body._id;
                        done();
                    });
            });
        });
        describe('Get the slide just posted', function() {
            it('should return json containing the slide data just submitted', function(done) {
                chai.request(server)
                    .get('/api/slide/' + slideId + '?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', slideId);
                        expect(res.body).to.have.property('name', 'Test Slide');
                        expect(res.body).to.have.property('imagePath', 'test_image_path.jpg');
                        expect(res.body).to.have.property('imageAlt', 'image alt');
                        expect(res.body).to.have.property('video', videoId);
                        expect(res.body).to.have.property('description', 'Test Description');
                        done();
                    });
            });
        });
        describe('Get all the slides', function() {
            it('should return an array of json slide data', function(done) {
                chai.request(server)
                    .get('/api/slide?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('_id');
                        expect(res.body[0]).to.have.property('name');
                        expect(res.body[0]).to.have.property('imagePath');
                        expect(res.body[0]).to.have.property('imageAlt');
                        expect(res.body[0]).to.have.property('video');
                        expect(res.body[0]).to.have.property('description');
                        done();
                    });
            });
        });
        describe('Update a slide, then check it was updated', function() {
            it('should return plan text "OK"', function(done) {
                chai.request(server)
                    .put('/api/slide/' + slideId + '?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        _id: slideId,
                        name: 'Test Slide updated',
                        imagePath: 'test_image_path_updated.jpg',
                        imageAlt: 'image alt updated',
                        video: videoId,
                        description: 'Test Description updated'
                    })
                    // TODO return json
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(res.text).to.equal('OK');
                        done();
                    });

                it('should return json with updated slide data', function(done) {
                    chai.request(server)
                        .get('/api/slide/' + slideId + '?' + apiVer)
                        .end(function(err, res) {
                            expect(res).to.have.status(200);
                            expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                            expect(res.body).to.have.property('_id', slideId);
                            expect(res.body).to.have.property('name', 'Test Slide updated');
                            expect(res.body).to.have.property('imagePath', 'test_image_path_updated.jpg');
                            expect(res.body).to.have.property('imageAlt', 'image alt updated');
                            expect(res.body).to.have.property('video', videoId);
                            expect(res.body).to.have.property('description', 'Test Description updated');
                            done();
                        });
                });

            });
        });
        describe('Delete the slide just created', function() {
            it('should delete the fuckin slide man', function(done) {
                chai.request(server)
                    .delete('/api/slide/' + slideId + '?' + apiVer)
                    .set('Authorization', token)
                    // TODO return json
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(res.text).to.equal('OK');
                        done();
                    });
            });
        });
    });
//--------------------------------------------------------------------------------------------------------------------->
    describe('Slide test apiVer 1.0.0', function() {
        var apiVer = 'apiVer=1.0.0';
        describe('Post a slide', function() {
            it('should return json containing the slide data just submitted', function(done) {
                chai.request(server)
                    .post('/api/slide?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        name: 'Test Slide',
                        imagePath: 'test_image_path.jpg',
                        imageAlt: 'image alt',
                        video: videoId,
                        description: 'Test Description'
                    })
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('name', 'Test Slide');
                        expect(res.body).to.have.property('imagePath', 'test_image_path.jpg');
                        expect(res.body).to.have.property('imageAlt', 'image alt');
                        expect(res.body).to.have.property('video', videoId);
                        expect(res.body).to.have.property('description', 'Test Description');
                        slideId = res.body._id;
                        done();
                    });
            });
        });
        describe('Get the slide just posted', function() {
            it('should return json containing the slide data just submitted', function(done) {
                chai.request(server)
                    .get('/api/slide/' + slideId + '?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', slideId);
                        expect(res.body).to.have.property('name', 'Test Slide');
                        expect(res.body).to.have.property('imagePath', 'test_image_path.jpg');
                        expect(res.body).to.have.property('imageAlt', 'image alt');
                        expect(res.body).to.have.property('video', videoId);
                        expect(res.body).to.have.property('description', 'Test Description');
                        done();
                    });
            });
        });
        describe('Get all the slides', function() {
            it('should return an array of json slide data', function(done) {
                chai.request(server)
                    .get('/api/slide?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('_id');
                        expect(res.body[0]).to.have.property('name');
                        expect(res.body[0]).to.have.property('imagePath');
                        expect(res.body[0]).to.have.property('imageAlt');
                        expect(res.body[0]).to.have.property('video');
                        expect(res.body[0]).to.have.property('description');
                        done();
                    });
            });
        });
        describe('Update a slide, then check it was updated', function() {
            it('should return plan text "OK"', function(done) {
                chai.request(server)
                    .put('/api/slide/' + slideId + '?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        _id: slideId,
                        name: 'Test Slide updated',
                        imagePath: 'test_image_path_updated.jpg',
                        imageAlt: 'image alt updated',
                        video: videoId,
                        description: 'Test Description updated'
                    })
                    // TODO return json
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(res.text).to.equal('OK');
                        done();
                    });

                it('should return json with updated slide data', function(done) {
                    chai.request(server)
                        .get('/api/slide/' + slideId + '?' + apiVer)
                        .end(function(err, res) {
                            expect(res).to.have.status(200);
                            expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                            expect(res.body).to.have.property('_id', slideId);
                            expect(res.body).to.have.property('name', 'Test Slide updated');
                            expect(res.body).to.have.property('imagePath', 'test_image_path_updated.jpg');
                            expect(res.body).to.have.property('imageAlt', 'image alt updated');
                            expect(res.body).to.have.property('video', videoId);
                            expect(res.body).to.have.property('description', 'Test Description updated');
                            done();
                        });
                });

            });
        });
        describe('Delete the slide just created', function() {
            it('should delete the fuckin slide man', function(done) {
                chai.request(server)
                    .delete('/api/slide/' + slideId + '?' + apiVer)
                    .set('Authorization', token)
                    // TODO return json
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(res.text).to.equal('OK');
                        done();
                    });
            });
        });
    });
//--------------------------------------------------------------------------------------------------------------------->
    describe('Slide test apiVer 2.0.0', function() {
        var apiVer = 'apiVer=2.0.0';
        describe('Post a slide', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/slide?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        name: 'Test Slide',
                        imagePath: 'test_image_path.jpg',
                        imageAlt: 'image alt',
                        video: videoId,
                        description: 'Test Description'
                    })
                    .end(function(err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get the slide just posted', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/slide/' + slideId + '?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get all the slides', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/slide?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Update a slide, then check it was updated', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .put('/api/slide/' + slideId + '?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        _id: slideId,
                        name: 'Test Slide updated',
                        imagePath: 'test_image_path_updated.jpg',
                        imageAlt: 'image alt updated',
                        video: videoId,
                        description: 'Test Description updated'
                    })
                    // TODO return json
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });

                it('should return a 400 and invalid api version json', function (done) {
                    chai.request(server)
                        .get('/api/slide/' + slideId + '?' + apiVer)
                        .end(function(err, res) {
                            expect(res).to.have.status(400);
                            expect(res.body).to.have.property("error", "invalid api version")
                            done();
                        });
                });

            });
        });
        describe('Delete the slide just created', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .delete('/api/slide/' + slideId + '?' + apiVer)
                    .set('Authorization', token)
                    // TODO return json
                    .end(function(err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
    });

});