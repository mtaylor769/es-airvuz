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

  afterAll(function() {
    //clean up and delete test users

  });


});