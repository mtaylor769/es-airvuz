describe('Users', function () {
  var Promise = require('bluebird');
  var Users = require('../../../app/persistence/crud/users');
  var validUser = {
    sessionId     : "sessionId",
    emailAddress  : "test@email.com",
    password      : "testABC124",
    firstName     : "Zeke",
    lastName      : "Thao"
  }

  var invalidUser = {
    sessionId     : "sessionId",
    firstName     : "Zeke",
    lastName      : "Thao"
  }

  describe("Create", function(done){
    it('returns a Promise after creating a user', function () {
      var returnPromise = Users.create(validUser);
      expect(returnPromise).toBe(jasmine.any(Promise));
      done();
    });
  });

  afterAll(function() {
    //clean up and delete test users

  });


});