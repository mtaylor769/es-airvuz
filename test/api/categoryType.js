/**
 * Run with:
 * mocha test/api/
 * node_modules/mocha/bin/mocha test/api
 *
 */
/* global expect: true */
var request    = require('supertest');
var app        = require('../../app');
var testCategory  = require('../mockObjects/categoryType');
var expect     = require('chai').expect;
var request    = request.agent(app);

describe('Categories', function() {

  var category = testCategory;
  var API_URL = '/api/category-type';
  var categoryId;

  describe('POST' + API_URL, function() {
    it('should create a new category', function(done) {
      request
        .post(API_URL)
        .send(category)
        .expect(200)
        .expect(function(response) {
          var newCategory = response.body;

          expect(newCategory).to.have.property('_id');

          categoryId = newCategory._id;

        })
        .end(done);
    })
  });

  describe('GET ALL' + API_URL, function() {
    it('should get all categories', function(done) {
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

  //describe('GET ONE' + API_URL, function() {
  //  it('should get one category by ID', function(done) {
  //    request
  //  })
  //});

});