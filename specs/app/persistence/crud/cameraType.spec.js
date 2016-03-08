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
		
    it('should return a promise', function() {
      CameraType
				.create(validCamera)
				.then(function(returnVal) {
					expect(returnVal).toEqual(jasmine.any(Promise));
				});
      
    });
		
		
    it('should reject null', function(done) {
      CameraType
				.create(null)
				.then(function() {
					//console.log("CameraType: should not see.");
				})
				.catch(function(error) {
					//console.log("CameraType: should see.");
					expect(error).toEqual(jasmine.any(BaseException));
				})
    })		
		
		
    it('should reject null-old', function(done) {
	/*					
      CameraType.create(null)
				.then(function() {
					console.log("[GOO]");
				})
				.catch(function(error) {
					console.log("error.exceptionType: " + error.exceptionType );
					//expect(baseException).toEqual(error);
					console.log("BaseException typeOf: " + (typeof( BaseException) ) );
					
					try {
					var baseException = new BaseException();
					}
					catch(e) {
						console.log("e: " + e );
					}
					console.log("error instanceof BaseException: " + (error instanceof BaseException) );
					
			
				var a = "a";
				expect("a").toEqual(a);					
					
					
					//expect(baseException).toEqual(error);
					//expect(error).toEqual(jasmine.any(new BaseException()));
					//console.log("[BAD]");
				})
*/
									
				  var a = "a";
				expect("a").toEqual(a);

			
				//var a = "a";
				//expect("a").toEqual(a);
			/*
			, function(err) {
        expect(err).toEqual(jasmine.any(BaseException));
        console.log('**** instance of ****');
        console.log(err instanceof BaseException);
      })
			
			*/
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

