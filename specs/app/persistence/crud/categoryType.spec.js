var categoryTypeModel = require('../../../../app/persistence/model/categoryType');
var Promise = require('bluebird');
var BaseException					= require('../../../../app/utils/exceptions/BaseException');

describe('CategoryType', function() {
  var CategoryType = require('../../../../app/persistence/crud/categoryType');
  var validCategory = {
    backGroundImage: 'something.jpg',
    name: 'someCat',
    isVisible: true
  };
  var id = '55e557fd1497cb362da8873f';

//afterAll(function(done) {
//  categoryTypeModel.find(validCategory).exec()
//  .then(function(types){
//    types.forEach(function(type) {
//      type.remove();
//    });
//    done();
//  })
//});
  describe('#create', function() {
		
    xit('should return a promise', function() {
      var returnVal = CategoryType.create(validCategory);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
		
    it('should reject null', function(done) {
      CategoryType.create(null).then(function() {
      }, function(err) {
        expect(err).toEqual(jasmine.any(BaseException));
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
      var returnVal = CategoryType.getById(id);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#remove', function() {
    it('should return a promise', function() {
      var returnVal = CategoryType.remove(id);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

});