var curatedVideoModel = require('../../../../app/persistence/model/curatedVideos');
var Promise = require('bluebird');
var ErrorMessage = require('../../../../app/utils/errorMessage');

describe('CuratedVideos', function() {
  var CuratedVideos = require('../../../../app/persistence/crud/curatedVideos');
  var validCuratedVideo = {
    curatedType: 'FEATURED',
    videoId: '55e557fd1497cb362da8873f',
    viewOrder: 12
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
      var returnVal = CuratedVideos.create(validCuratedVideo);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
    xit('should reject null', function(done) {
      CuratedVideos.create(null).then(function() {
        throw new Error('resolve should not be called');
      }, function(err) {
        expect(err).toEqual(jasmine.any(ErrorMessage));
        done();
      })
    })
  });

  describe('#get', function() {
    it('should return a promise', function() {
      var returnVal = CuratedVideos.get();
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#getById', function() {
    it('should return a promise', function() {
      var returnVal = CuratedVideos.getById(id);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

  describe('#remove', function() {
    it('should return a promise', function() {
      var returnVal = CuratedVideos.remove(id);
      expect(returnVal).toEqual(jasmine.any(Promise))
    });
  });

});

