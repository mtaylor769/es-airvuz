var chai        = require('chai');
var chaiHttp    = require('chai-http');
var server      = 'http://' + process.env.NODE_TEST_ENV;
var expect      = require('chai').expect;

var testEmailAddress = process.env.TEST_EMAIL;
var userNameDisplay = process.env.TEST_USER;
var testPassword = process.env.TEST_PWD;

var token;
var userId;
var videoId = '57b24c25beb6e09523772298';
var slides = '5755c8a2fc2f9c228701978a';
var slidesUpdated = '57645b4f053b60a72c875f24';
var sliderId;

if (process.env.NODE_TEST_ENV == 'beta.airvuz.com') {
    var startDateReturned = '2001-01-01T00:00:00.000Z';
    var updatedStartDateReturned = '2001-02-02T00:00:00.000Z';
    var endDateReturned = '2051-01-01T00:00:00.000Z';
    var updatedEndDateReturned = '2051-02-02T00:00:00.000Z';
} else if (process.env.NODE_TEST_ENV == 'www.airvuz.com') {
    var startDateReturned = '2001-01-01T00:00:00.000Z';
    var updatedStartDateReturned = '2001-02-02T00:00:00.000Z';
    var endDateReturned = '2051-01-01T00:00:00.000Z';
    var updatedEndDateReturned = '2051-02-02T00:00:00.000Z';
} else {
    var startDateReturned = '2001-01-01T06:00:00.000Z';
    var updatedStartDateReturned = '2001-02-02T06:00:00.000Z';
    var endDateReturned = '2051-01-01T06:00:00.000Z';
    var updatedEndDateReturned = '2051-02-02T06:00:00.000Z';
}

chai.use(chaiHttp);

describe('Slider API tests', function() {
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
    describe('Slider test no apiVer', function() {
        var apiVer = 'apiVer=';
        describe('Post a slider', function () {
            it('should return json containing the slide data just submitted', function (done) {
                chai.request(server)
                    .post('/api/slider?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        name: 'Test Slider',
                        startDate: '1/1/2001',
                        endDate: '1/1/2051',
                        isActive: true,
                        slides: slides
                    })
                    // TODO format the output date shorter
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('name', 'Test Slider')
                        expect(res.body).to.have.property('startDate', startDateReturned)
                        expect(res.body).to.have.property('endDate', endDateReturned)
                        expect(res.body).to.have.property('isActive', true)
                        expect(res.body.slides[0]).to.equal(slides);
                        sliderId = res.body._id;
                        done();
                    });
            });
        });
        describe('Get the posted slider', function () {
            it('should return json containing the slide data just submitted', function (done) {
                chai.request(server)
                    .get('/api/slider/' + sliderId + '?' + apiVer)
                    // TODO format the output date shorter
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', sliderId);
                        expect(res.body).to.have.property('name', 'Test Slider')
                        expect(res.body).to.have.property('startDate', startDateReturned)
                        expect(res.body).to.have.property('endDate', endDateReturned)
                        expect(res.body).to.have.property('isActive', true)
                        expect(res.body.slides[0]._id).to.equal(slides);
                        sliderId = res.body._id;
                        done();
                    });
            });
        });
        describe('Get all the sliders', function() {
            it('should return an array of json slider data', function (done) {
                chai.request(server)
                    .get('/api/slider?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('_id');
                        expect(res.body[0]).to.have.property('name')
                        expect(res.body[0]).to.have.property('startDate')
                        expect(res.body[0]).to.have.property('endDate')
                        expect(res.body[0]).to.have.property('isActive')
                        done();
                    });
            });
        });
        describe('Update a slider, then check it was updated', function() {
            it('should update the slider', function(done) {
                chai.request(server)
                    .put('/api/slider/' + sliderId + '?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        _id: sliderId,
                        name: 'Test Slider updated',
                        startDate: '2/2/2001',
                        endDate: '2/2/2051',
                        isActive: false,
                        slides: slidesUpdated
                    })
                    //TODO this would make more sense to return the updated data, not the original data
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', sliderId);
                        expect(res.body).to.have.property('name', 'Test Slider');
                        expect(res.body).to.have.property('startDate', startDateReturned);
                        expect(res.body).to.have.property('endDate', endDateReturned);
                        expect(res.body).to.have.property('isActive', true);
                        expect(res.body.slides[0]).to.equal(slides);
                        done();
                    });
            });
            it('should return json with updated slider data', function(done) {
                chai.request(server)
                    .get('/api/slider/' + sliderId + '?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', sliderId);
                        expect(res.body).to.have.property('name', 'Test Slider updated')
                        expect(res.body).to.have.property('startDate', updatedStartDateReturned)
                        expect(res.body).to.have.property('endDate', updatedEndDateReturned)
                        expect(res.body).to.have.property('isActive', false)
                        expect(res.body.slides[0]._id).to.equal(slidesUpdated);
                        done();
                    });
            });
        });

        describe('Get the home slider', function() {
            it('should return the data for the home slider', function(done) {
                chai.request(server)
                    .get('/api/home-slider/' + sliderId + '?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', sliderId);
                        expect(res.body).to.have.property('name', 'Test Slider updated')
                        expect(res.body).to.have.property('startDate', updatedStartDateReturned)
                        expect(res.body).to.have.property('endDate', updatedEndDateReturned)
                        expect(res.body).to.have.property('isActive', false)
                        expect(res.body.slides._id).to.equal(slidesUpdated);
                        done();
                    });
            });
        });
        describe('Delete the slider', function() {
            it('should delete the slider', function(done) {
                chai.request(server)
                    .delete('/api/slider/' + sliderId + '?' + apiVer)
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
    describe('Slider test apiVer 1.0.0', function() {
        var apiVer = 'apiVer=1.0.0';
        describe('Post a slider', function () {
            it('should return json containing the slide data just submitted', function (done) {
                chai.request(server)
                    .post('/api/slider?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        name: 'Test Slider',
                        startDate: '1/1/2001',
                        endDate: '1/1/2051',
                        isActive: true,
                        slides: slides
                    })
                    // TODO format the output date shorter
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('name', 'Test Slider')
                        expect(res.body).to.have.property('startDate', startDateReturned)
                        expect(res.body).to.have.property('endDate', endDateReturned)
                        expect(res.body).to.have.property('isActive', true)
                        expect(res.body.slides[0]).to.equal(slides);
                        sliderId = res.body._id;
                        done();
                    });
            });
        });
        describe('Get the posted slider', function () {
            it('should return json containing the slide data just submitted', function (done) {
                chai.request(server)
                    .get('/api/slider/' + sliderId + '?' + apiVer)
                    // TODO format the output date shorter
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', sliderId);
                        expect(res.body).to.have.property('name', 'Test Slider')
                        expect(res.body).to.have.property('startDate', startDateReturned)
                        expect(res.body).to.have.property('endDate', endDateReturned)
                        expect(res.body).to.have.property('isActive', true)
                        expect(res.body.slides[0]._id).to.equal(slides);
                        sliderId = res.body._id;
                        done();
                    });
            });
        });
        describe('Get all the sliders', function() {
            it('should return an array of json slider data', function (done) {
                chai.request(server)
                    .get('/api/slider?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('_id');
                        expect(res.body[0]).to.have.property('name')
                        expect(res.body[0]).to.have.property('startDate')
                        expect(res.body[0]).to.have.property('endDate')
                        expect(res.body[0]).to.have.property('isActive')
                        done();
                    });
            });
        });
        describe('Update a slider, then check it was updated', function() {
            it('should update the slider', function(done) {
                chai.request(server)
                    .put('/api/slider/' + sliderId + '?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        _id: sliderId,
                        name: 'Test Slider updated',
                        startDate: '2/2/2001',
                        endDate: '2/2/2051',
                        isActive: false,
                        slides: slidesUpdated
                    })
                    //TODO this would make more sense to return the updated data, not the original data
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', sliderId);
                        expect(res.body).to.have.property('name', 'Test Slider');
                        expect(res.body).to.have.property('startDate', startDateReturned);
                        expect(res.body).to.have.property('endDate', endDateReturned);
                        expect(res.body).to.have.property('isActive', true);
                        expect(res.body.slides[0]).to.equal(slides);
                        done();
                    });
            });
            it('should return json with updated slider data', function(done) {
                chai.request(server)
                    .get('/api/slider/' + sliderId + '?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', sliderId);
                        expect(res.body).to.have.property('name', 'Test Slider updated')
                        expect(res.body).to.have.property('startDate', updatedStartDateReturned)
                        expect(res.body).to.have.property('endDate', updatedEndDateReturned)
                        expect(res.body).to.have.property('isActive', false)
                        expect(res.body.slides[0]._id).to.equal(slidesUpdated);
                        done();
                    });
            });
        });

        describe('Get the home slider', function() {
            it('should return the data for the home slider', function(done) {
                chai.request(server)
                    .get('/api/home-slider/' + sliderId + '?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('_id', sliderId);
                        expect(res.body).to.have.property('name', 'Test Slider updated')
                        expect(res.body).to.have.property('startDate', updatedStartDateReturned)
                        expect(res.body).to.have.property('endDate', updatedEndDateReturned)
                        expect(res.body).to.have.property('isActive', false)
                        expect(res.body.slides._id).to.equal(slidesUpdated);
                        done();
                    });
            });
        });
        describe('Delete the slider', function() {
            it('should delete the slider', function(done) {
                chai.request(server)
                    .delete('/api/slider/' + sliderId + '?' + apiVer)
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
    describe('Slider test apiVer 2.0.0', function() {
        var apiVer = 'apiVer=2.0.0';
        describe('Post a slider', function () {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/slider?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        name: 'Test Slider',
                        startDate: '1/1/2001',
                        endDate: '1/1/2051',
                        isActive: true,
                        slides: slides
                    })
                    // TODO format the output date shorter
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get the posted slider', function () {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/slider/' + sliderId + '?' + apiVer)
                    // TODO format the output date shorter
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get all the sliders', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/slider?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Update a slider, then check it was updated', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .put('/api/slider/' + sliderId + '?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        _id: sliderId,
                        name: 'Test Slider updated',
                        startDate: '2/2/2001',
                        endDate: '2/2/2051',
                        isActive: false,
                        slides: slidesUpdated
                    })
                    //TODO this would make more sense to return the updated data, not the original data
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/slider/' + sliderId + '?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });

        describe('Get the home slider', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/home-slider/' + sliderId + '?' + apiVer)
                    .end(function(err, res) {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Delete the slider', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .delete('/api/slider/' + sliderId + '?' + apiVer)
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