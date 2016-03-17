/**
 * Run with:
 * mocha test/api/
 * node_modules/mocha/bin/mocha test/api
 *
 */
/* global expect: true */
var request    = require('supertest');
var app        = require('../../app');
var testCamera  = require('../mockObjects/CameraType');
var expect     = require('chai').expect;
var request    = request.agent(app);

describe('CameraType', function() {

  var camera = testCamera;
  var API_URL = '/api/camera-type';
  var cameraId;
  describe('POST' + API_URL, function() {
    it('should create a camera', function(done) {
      request
        .post(API_URL)
        .send(camera)
        .expect(200)
        .expect(function(response) {
          cameraId = response.body._id;
        })
        .end(done);
    })
  });

  describe('GET ALL' + API_URL, function() {
    it('should get all cameras', function(done) {
      request
        .get(API_URL)
        .send()
        .expect(200)
        .expect(function(response) {
          expect(response.body).to.be.an('array');
        })
        .end(done);

    })
  });

  describe('GET ONE' + API_URL, function() {
    it('should get one camera', function(done) {
      request
        .get(API_URL + '/' + cameraId)
        .send()
        .expect(200)
        .expect(function(response) {
          var cameraInfo = response.body;

          expect(cameraInfo).to.have.property('manufacturer');
          expect(cameraInfo).to.have.property('model');
          expect(cameraInfo).to.have.property('isVisible');
        })
        .end(done);
    })
  });

  describe('PUT' + API_URL, function() {
    it('should update one camera', function(done) {
      request
        .put(API_URL + '/' + cameraId)
        .send({_id: cameraId, manufacturer: 'newMan'})
        .expect(200)
        .expect(function(response) {
          var manufacturerCheck = response.body.manufacturer;

          expect(manufacturerCheck).to.equal('newMan');
        })
        .end(done);
    })
  });

  describe('DELETE' + API_URL, function() {
    it('should delete one video', function(done) {
      request
        .delete(API_URL + '/' + cameraId)
        .send()
        .expect(200)
        .end(done)
    })
  })


});