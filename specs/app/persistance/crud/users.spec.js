describe('Users', function () {
  var Promise = require('bluebird');
  var Users = require('../../../../app/persistence/crud/users');
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

  describe("Create", function(){
    it('returns a Promise after creating a user', function (done) {
      var returnPromise = Users.create(null);
      expect(returnPromise).toEqual(jasmine.any(Promise));
      done();
    });
  });

  afterAll(function() {
    //clean up and delete test users

  });


});