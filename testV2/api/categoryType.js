var chai        = require('chai');
var chaiHttp    = require('chai-http');
var host        = 'http://' + (process.env.HOST || 'localhost');
var server      = host + ":" + (process.env.PORT || 80);
var expect      = require('chai').expect;

var token;
var userId;
var userNameDisplay = 'bryceb';
var categoryId;

chai.use(chaiHttp);

describe('Category Type API tests', function() {
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
    describe('Category API tests no apiVer', function() {
        var apiVer = 'apiVer=';
        describe('Create a category', function() {
          it('should create a category and return json with inserted data', function(done) {
              chai.request(server)
                  .post('/api/category-type/?' + apiVer)
                  .set('Authorization', token)
                  .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                  .send({
                      backGroundImage: 'image.jpg',
                      name: 'Test Category',
                      isVisible: true
                  })
                  .end(function (err, res) {
                      expect(res).to.have.status(200);
                      expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                      expect(res.body).to.have.property('backGroundImage', 'image.jpg');
                      expect(res.body).to.have.property('name', 'Test Category');
                      expect(res.body).to.have.property('isVisible', true);
                      expect(res.body).to.have.property('_id');
                      categoryId = res.body._id;
                      done();
                  })
          })
        })
        describe('Get the category just created', function() {
          it('should get a category and return json with the category data', function(done) {
              chai.request(server)
                  .get('/api/category-type/' + categoryId + '/?' + apiVer)
                  .end(function (err, res) {
                      expect(res).to.have.status(200);
                      expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                      expect(res.body).to.have.property('backGroundImage', 'image.jpg');
                      expect(res.body).to.have.property('name', 'Test Category');
                      expect(res.body).to.have.property('isVisible', true);
                      expect(res.body).to.have.property('_id', categoryId);
                      done();
                  });
          });
        });
        describe('Update the category just created', function() {
          it('should update a category and return json with the category data', function(done) {
              chai.request(server)
                  .put('/api/category-type/' + categoryId + '/?' + apiVer)
                  .set('Authorization', token)
                  .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                  .send({
                      backGroundImage: 'image2.jpg',
                      name: 'Updated test Category',
                      isVisible: false,
                      _id: categoryId
                  })
                  .end(function (err, res) {
                      expect(res).to.have.status(200);
                      expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                      expect(res.body).to.have.property('backGroundImage', 'image2.jpg');
                      expect(res.body).to.have.property('name', 'Updated test Category');
                      expect(res.body).to.have.property('isVisible', false);
                      expect(res.body).to.have.property('_id', categoryId);
                      done();
                  });
          });
        });
        describe('Delete the category just created', function() {
          it('should delete a category and return a plain text "OK"', function(done) {
              chai.request(server)
                  .delete('/api/category-type/' + categoryId + '/?' + apiVer)
                  .set('Authorization', token)
                  .end(function (err, res) {
                      expect(res).to.have.status(200);
                      expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                      expect(res.text).to.equal('OK');
                      done();
                  });
          });
        });
        describe('Get an array of categories just created', function() {
          it('should return an array of categories the logged in user has access to', function(done) {
              chai.request(server)
                  .get('/api/category-type/by-roles/?' + apiVer)
                  .set('Authorization', token)
                  .end(function (err, res) {
                      expect(res).to.have.status(200);
                      expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                      expect(res.body[0]).to.have.property('_id');
                      expect(res.body[0]).to.have.property('categoryTypeUrl');
                      expect(res.body[0]).to.have.property('name');
                      expect(res.body[0]).to.have.property('nameV1');
                      expect(res.body[0]).to.have.property('isVisible');
                      done();
                  });
          });
        });
    });
    describe('Category API tests apiVer 1.0.0', function() {
        var apiVer = 'apiVer=1.0.0';
        describe('Create a category', function() {
            it('should create a category and return json with inserted data', function(done) {
                chai.request(server)
                    .post('/api/category-type/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({
                        backGroundImage: 'image.jpg',
                        name: 'Test Category',
                        isVisible: true
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('backGroundImage', 'image.jpg');
                        expect(res.body).to.have.property('name', 'Test Category');
                        expect(res.body).to.have.property('isVisible', true);
                        expect(res.body).to.have.property('_id');
                        categoryId = res.body._id;
                        done();
                    })
            })
        })
        describe('Get the category just created', function() {
            it('should get a category and return json with the category data', function(done) {
                chai.request(server)
                    .get('/api/category-type/' + categoryId + '/?' + apiVer)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('backGroundImage', 'image.jpg');
                        expect(res.body).to.have.property('name', 'Test Category');
                        expect(res.body).to.have.property('isVisible', true);
                        expect(res.body).to.have.property('_id', categoryId);
                        done();
                    });
            });
        });
        describe('Update the category just created', function() {
            it('should update a category and return json with the category data', function(done) {
                chai.request(server)
                    .put('/api/category-type/' + categoryId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({
                        backGroundImage: 'image2.jpg',
                        name: 'Updated test Category',
                        isVisible: false,
                        _id: categoryId
                    })
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body).to.have.property('backGroundImage', 'image2.jpg');
                        expect(res.body).to.have.property('name', 'Updated test Category');
                        expect(res.body).to.have.property('isVisible', false);
                        expect(res.body).to.have.property('_id', categoryId);
                        done();
                    });
            });
        });
        describe('Delete the category just created', function() {
            it('should delete a category and return a plain text "OK"', function(done) {
                chai.request(server)
                    .delete('/api/category-type/' + categoryId + '/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'text/plain; charset=utf-8');
                        expect(res.text).to.equal('OK');
                        done();
                    });
            });
        });
        describe('Get an array of categories just created', function() {
            it('should return an array of categories the logged in user has access to', function(done) {
                chai.request(server)
                    .get('/api/category-type/by-roles/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', 'application/json; charset=utf-8');
                        expect(res.body[0]).to.have.property('_id');
                        expect(res.body[0]).to.have.property('categoryTypeUrl');
                        expect(res.body[0]).to.have.property('name');
                        expect(res.body[0]).to.have.property('nameV1');
                        expect(res.body[0]).to.have.property('isVisible');
                        done();
                    });
            });
        });
    });
    describe('Category API tests apiVer 2.0.0', function() {
        var apiVer = 'apiVer=2.0.0';
        describe('Create a category', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .post('/api/category-type/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({
                        backGroundImage: 'image.jpg',
                        name: 'Test Category',
                        isVisible: true
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get the category just created', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/category-type/' + categoryId + '/?' + apiVer)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Update the category just created', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .put('/api/category-type/' + categoryId + '/?' + apiVer)
                    .set('Authorization', token)
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
                    .send({
                        backGroundImage: 'image2.jpg',
                        name: 'Updated test Category',
                        isVisible: false,
                        _id: categoryId
                    })
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Delete the category just created', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .delete('/api/category-type/' + categoryId + '/?' + apiVer)
                    .set('Authorization', token)
                    .end(function (err, res) {
                        var data = res.body;
                        expect(res).to.have.status(400);
                        expect(data).to.have.property("error", "invalid api version")
                        done();
                    });
            });
        });
        describe('Get an array of categories just created', function() {
            it('should return a 400 and invalid api version json', function (done) {
                chai.request(server)
                    .get('/api/category-type/by-roles/?' + apiVer)
                    .set('Authorization', token)
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