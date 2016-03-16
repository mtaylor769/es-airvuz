/**
 * Run with:
 * mocha test/api/
 * node_modules/mocha/bin/mocha test/api
 *
 */
/* global expect: true */
var request    = require('supertest');
var app        = require('../../app');
var testVideo  = require('../mockObjects/videos');
var expect     = require('chai').expect;
var request    = request.agent(app);

describe('Videos', function() {

  var video = testVideo;
  var API_URL = '/api/videos';
  var videoId;
  before(function(done) {
    request.post(API_URL)
      .send(video)
      .expect(200)
      .expect(function(response) {
        videoId = response.body._id;
      })
      .end(done)
  });

  describe('GET' + API_URL, function() {
    it('should return users info', function(done) {
      request.get(API_URL)
        .send({_id: videoId})
        .expect(200)
        .end(function(err, res) {
          var data = res.body;
          expect(data).to.have.property('title');
          expect(data).to.have.property('categories');
          done();
        })

    })
  });

  describe('PUT' + API_URL, function() {
    it('should replace title', function(done) {
      request.put(API_URL + '/'  + videoId)
        .send({_id: videoId, title: 'We are changing this'})
        .expect(200)
        .end(function(err, res) {
          var title = res.body.title;
          expect(title).to.equal('We are changing this')
          done();
        })
    })
  })
});