/**
 * Run with:
 * mocha test/api/
 * node_modules/mocha/bin/mocha test/api
 *
 */
/* global expect: true */
var request    = require('supertest');
var app        = require('../../app');
var testDrone  = require('../mockObjects/droneType');
var expect     = require('chai').expect;
var request    = request.agent(app);

describe('DroneType', function() {

  var drone = testDrone;
  var API_URL = '/api/drone-type';
  var droneId;
  describe('POST' + API_URL, function() {
    it('should create a drone', function(done) {
      request
        .post(API_URL)
        .send(testDrone)
        .expect(200)
        .expect(function(response) {
          droneId = response.body._id;
        })
        .end(done);
    })
  });

  describe('GET ALL' + API_URL, function() {
    it('should get all drones', function(done) {
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
    it('should get one drone', function(done) {
      request
        .get(API_URL + '/' + droneId)
        .send()
        .expect(200)
        .expect(function(response) {
          var droneInfo = response.body;

          expect(droneInfo).to.have.property('manufacturer');
          expect(droneInfo).to.have.property('model');
          expect(droneInfo).to.have.property('isVisible');
        })
        .end(done);
    })
  });

  describe('PUT' + API_URL, function() {
    it('should update one drone', function(done) {
      request
        .put(API_URL + '/' + droneId)
        .send({_id: droneId, manufacturer: 'newMan'})
        .expect(200)
        .expect(function(response) {
          var manufacturerCheck = response.body.manufacturer;

          expect(manufacturerCheck).to.equal('newMan');
        })
        .end(done);
    })
  });

  describe('DELETE' + API_URL, function() {
    it('should delete one drone', function(done) {
      request
        .delete(API_URL + '/' + droneId)
        .send()
        .expect(200)
        .end(done)
    })
  })


});