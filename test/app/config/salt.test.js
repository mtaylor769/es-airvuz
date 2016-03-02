var expect = require('expect.js');

describe('Salt', function () {

  var salt = require('../../../app/config/salt');

  it('should be a string', function () {
    expect(salt).to.be.a('string');
  });

});