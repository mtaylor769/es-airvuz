describe('Salt', function () {

  var salt = require('../../../app/config/salt');

  it('should be a string', function () {
    expect(salt).toEqual(jasmine.any(String));
  });

});