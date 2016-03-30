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
      console.log(comment);
      request
        .post(API_URL)
        .send(comment)
        .expect(200)
        .expect(function(response) {
          console.log(response.body);
          commentId = response.body._id;
        })
        .end(done);
    })
  });

  describe('GET ALL' + API_URL, function() {
    it('should get all comments', function(done) {
      request
        .get(API_URL)
        .send()
        .expect(200)
        .expect(function(response) {
          var returnArray = response.body;

          expect(returnArray).to.be.an('array');
        })
        .end(done);
    })
  });

  describe('GET ONE' + API_URL, function() {
    it('should get comment by Id', function(done) {
      request
      .get(API_URL + '/' + commentId)
      .send()
      .expect(200)
      .expect(function(response) {
        var valueCheck = response.body;

        expect(valueCheck.comment).to.equal('this is a test comment');
      })
      .end(done);
    })
  });

  describe('PUT' + API_URL, function() {
    it('should update a comment', function(done) {
      request
      .put(API_URL + '/' + commentId)
      .send({_id: commentId, comment: 'this is changed'})
      .expect(200)
      .expect(function(response) {
        var commentCheck = response.body.comment;

        expect(commentCheck).to.equal('this is changed');
      })
      .end(done);
    })
  });

  describe('DELETE' + API_URL, function() {
    it('should delete the created comment', function(done) {
      request
      .delete(API_URL + '/' + commentId)
      .end()
      .expect(200)
      .end(done);
    })
  });

  describe('GET BY PARENT' + API_URL, function() {
    it('should get all comments by parent id', function(done) {
      request
      .get(API_URL + '/byParent')
      .send({parentId: '56f574ecc1d6a2561f9d65dc'})
      .expect(200)
      .expect(function(response) {
        console.log(response.body);
      })
      .end(done);
    })
  });
});