var cameraTypeModel = require('../../../../app/persistence/model/cameraType');
var Promise = require('bluebird');
var ErrorMessage = require('../../../../app/utils/errorMessage');

describe('CameraType', function() {
var CameraType = require('../../../../app/persistence/crud/cameraType');
var validCamera = {
  manufacturer: 'test_man',
  model: 'test_mod',
  isVisible: true
};

//afterAll(function(done) {
//  cameraTypeModel.find(validCamera).exec(function(types) {
//    types.forEach(function(type) {
//      type.remove();
//    });
//    done();
//  })
//}, 30000);
  describe('#create', function() {
    it('should return a promise', function() {
      var returnVal = CameraType.create(validCamera);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
    xit('should reject null', function(done) {

      CameraType.create(null).then(function() {
        throw new Error('resolve should not be called');
      }, function(err) {
        expect(err).toEqual(jasmine.any(ErrorMessage));
        done();
      })
    })
  });

  describe('#get', function() {
    it('should return a promise', function() {
      var returnVal = CameraType.get();
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#getById', function() {
    it('should return a promise', function() {
      var returnVal = CameraType.getById();
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

});

