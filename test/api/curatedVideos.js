/**
 * Run with:
 * mocha test/api/
 * node_modules/mocha/bin/mocha test/api
 *
 */
/* global expect: true */
var request    = require('supertest');
var app        = require('../../app');
var testCurated  = require('../mockObjects/curatedVideos');
var expect     = require('chai').expect;
var request    = request.agent(app);

describe('CuratedVideos', function() {
  var curatedVideo = testCurated;
  var API_URL = '/api/curated-videos';
  var curatedId;

  describe('POST' + API_URL, function() {
    it('should create a new video', function(done) {
      request
        .post(API_URL)
        .send(curatedVideo)
        .expect(200)
        .expect(function(response) {
          curatedId = response.body._id;
        })
        .end(done);
    })
  });

  describe('GET TYPE' + API_URL, function() {
    it('should get all by type', function(done) {
      request
        .get(API_URL)
        .send({type: 'testing'})
        .expect(200)
        .expect(function(response) {
        expect(response.body).to.be.an('array');
        })
        .end(done);
    })
  });

  describe('GET ONE' + API_URL, function() {
    it('should get on curated video', function(done) {
      request
        .get(API_URL + '/' + curatedId)
        .send()
        .expect(200)
        .expect(function(response) {
          var curatedVideo = response.body;

          expect(curatedVideo).to.have.property('curatedType');
          expect(curatedVideo).to.have.property('videoId');
          expect(curatedVideo).to.have.property('viewOrder');
        })
        .end(done);
    })
  });

  describe('PUT' +API_URL, function() {
    it('should update one video', function(done) {
      request
        .put(API_URL + '/' + curatedId)
        .send({_id: curatedId, curatedType: 'somethingNew'})
        .expect(200)
        .expect(function(response) {
          var curatedCheck = response.body.curatedType;

          expect(curatedCheck).to.equal('somethingNew');
        })
        .end(done);
    })
  });

  describe('DELETE' + API_URL, function() {
    it('should delete video by ID', function(done) {
      request
        .delete(API_URL + '/' + curatedId)
        .send()
        .expect(200)
        .end(done);
    })
  });

});