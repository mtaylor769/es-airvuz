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
          console.log(response.body);
        })
        .end(done);
    })
  });


});