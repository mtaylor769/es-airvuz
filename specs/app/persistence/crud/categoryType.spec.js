var categoryTypeModel = require('../../../../app/persistence/model/categoryType');
var Promise = require('bluebird');
var ErrorMessage = require('../../../../app/utils/errorMessage');

describe('CameraType', function() {
  var CategoryType = require('../../../../app/persistence/crud/categoryType');
  var validCategory = {
    backGroundImage: 'something.jpg',
    name: 'someCat',
    isVisible: true
  };

afterAll(function(done) {
  categoryTypeModel.find(validCategory).exec()
  .then(function(types){
    types.forEach(function(type) {
      type.remove();
    });
    done();
  })
});
  describe('#create', function() {
    it('should return a promise', function() {
      var returnVal = CategoryType.create(validCategory);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
    xit('should reject null', function(done) {
      CategoryType.create(null).then(function() {
        throw new Error('resolve should not be called');
      }, function(err) {
        expect(err).toEqual(jasmine.any(ErrorMessage));
        done();
      })
    })
  });

  describe('#get', function() {
    it('should return a promise', function() {
      var returnVal = CategoryType.get();
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#getById', function() {
    it('should return a promise', function() {
      var returnVal = CategoryType.getById();
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#remove', function() {
    it('should return a promise', function() {
      var returnVal = CategoryType.remove();
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

});

