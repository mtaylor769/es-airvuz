describe('Users', function () {
  var Promise = require('bluebird');
  var Users = require('../../../../app/persistence/crud/users');
  var validUser = {
    sessionId     : "sessionId",
    emailAddress  : "test@email.com",
    password      : "testABC124",
    userName      : "zekethao",
    firstName     : "Zeke",
    lastName      : "Thao"
  }

  var invalidUser = {
    sessionId     : "sessionId",
    firstName     : "Zeke",
    lastName      : "Thao"
  }

  describe("Create", function(){
    it('returns a Promise after creating a user', function (done) {
      var returnPromise = Users.create(validUser);
      returnPromise.resolve("Success").then(function(value){
        console.log("value :" + value);
      });
      expect(returnPromise).toEqual(jasmine.any(Promise));
      done();
    });
  });

  describe("GetAllUsers", function(){
    it('returns a Promise with all users', function (done) {
      var returnPromise = Users.getAllUsers();
      returnPromise.resolve("Success").then(function(value){
      });
      expect(returnPromise).toEqual(jasmine.any(Promise));
      done();
    });
  });

  describe("GetUserById", function(){
    it('returns a Promise with user found by Id', function (done) {
      var returnPromise = Users.getUserById();
      returnPromise.resolve("Success").then(function(value){
      });
      expect(returnPromise).toEqual(jasmine.any(Promise));
      done();
    });
  });

  describe("GetUserByEmail", function(){
    it('returns a Promise with user found by Email', function (done) {
      var returnPromise = Users.getUserByEmail();
      returnPromise.resolve("Success").then(function(value){
      });
      expect(returnPromise).toEqual(jasmine.any(Promise));
      done();
    });
  });

  describe("GetUserByUsername", function(){
    it('returns a Promise with user found by username', function (done) {
      var returnPromise = Users.getUserByUserName();
      returnPromise.resolve("Success").then(function(value){
      });
      expect(returnPromise).toEqual(jasmine.any(Promise));
      done();
    });
  });

  afterAll(function() {
    //clean up and delete test users

  });


});