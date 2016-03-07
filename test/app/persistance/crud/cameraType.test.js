var expect = require('expect.js');

describe('CameraType', function() {

  var CameraType = require('../../../../app/persistence/crud/cameraType');

  it('should be an object', function() {
    expect(CameraType).to.be.a('object');
  })
})