/**
 * Run with:
 * mocha test/api/
 * node_modules/mocha/bin/mocha test/api
 *
 */
/* global expect: true */
var request    = require('supertest');
var app        = require('../../app');
var testComment  = require('../mockObjects/comment');
var expect     = require('chai').expect;
var request    = request.agent(app);

describe('Comment', function() {

  var comment = testComment;
  var API_URL = '/api/comment';
  var commentId;
  describe('POST' + API_URL, function() {
    it('should create a new comment', function(done) {
      request
        .post(API_URL)
        .send(comment)
        .expect(200)
        .expect(function(response) {
          commentId = response.body._id;
        })
        .end(done);
    })
  });


});