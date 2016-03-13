var cameraTypeModel   = require('../../../../app/persistence/model/cameraType');
var Promise           = require('bluebird');
var BaseException		  = require('../../../../app/utils/exceptions/BaseException');

describe('CameraType', function() {
var CameraType        = require('../../../../app/persistence/crud/cameraType');
var validCamera       = {
  manufacturer: 'testMan',
  model: 'testMod',
  isVisible: true
};
var id = '55e557fd1497cb362da8873f';

//afterAll(function(done) {
//  cameraTypeModel.find(validCamera).exec(function(types) {
//    types.forEach(function(type) {
//      type.remove();
//    });
//    done();
//  })
//}, 30000);
  describe('#create', function() {

		it('should return a promise', function () {
			CameraType
				.create(validCamera)
				.then(function (returnVal) {
					expect(returnVal).toEqual(jasmine.any(Promise));
				});

		});


		it('should reject null', function (done) {
			CameraType.create(null).then(function () {
			}, function (err) {
				expect(err).toEqual(jasmine.any(BaseException));
				done();
			})
		});
	})

  describe('#get', function() {
    it('should return a promise', function() {
      var returnVal = CameraType.get();
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#getById', function() {
    it('should return a promise', function() {
      var returnVal = CameraType.getById(id);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#remove', function() {
    it('should return a promise', function() {
      var returnVal = CameraType.remove(id);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

});

