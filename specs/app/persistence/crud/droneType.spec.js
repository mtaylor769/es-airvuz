var droneTypeModel = require('../../../../app/persistence/model/droneType');
var Promise = require('bluebird');
var BaseException					= require('../../../../app/utils/exceptions/BaseException');

describe('DroneType', function() {
  var DroneType = require('../../../../app/persistence/crud/droneType');
  var validDroneType = {
    manufacturer: 'someManufacturer',
    model: 'someModel',
    isVisible: true
  };
  var id = '55e557fd1497cb362da8873f';

//afterAll(function(done) {
//  categoryTypeModel.find(validCuratedVideo).exec()
//  .then(function(types){
//    types.forEach(function(type) {
//      type.remove();
//    });
//    done();
//  })
//});
  describe('#create', function() {
    it('should return a promise', function() {
      var returnVal = DroneType.create(validDroneType);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
    it('should reject null', function(done) {
      DroneType.create(null).then(function() {
      }, function(err) {
        expect(err).toEqual(jasmine.any(BaseException));
        done();
      })
    })
  });

  describe('#get', function() {
    it('should return a promise', function() {
      var returnVal = DroneType.get();
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#getById', function() {
    it('should return a promise', function() {
      var returnVal = DroneType.getById(id);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#remove', function() {
    it('should return a promise', function() {
      var returnVal = DroneType.remove(id);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

});
