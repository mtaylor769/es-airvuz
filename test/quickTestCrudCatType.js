//node ./test/app/quickTestCrud



var log4js									= require('log4js');
var logger									= log4js.getLogger("test.quickTestCrud");

var BaseException						= require('../app/utils/exceptions/BaseException');
var PersistenceException		= require('../app/utils/exceptions/PersistenceException');
var ValidationException			= require('../app/utils/exceptions/ValidationException');


var CategoryType						= require('../app/persistence/crud/categoryType');

 



var catCreate = function(params) {
	CategoryType.create(params)
		.then(function() {
			logger.debug("CategoryType.created: ****************************");
		})
		.catch(function(error) {

			if(error instanceof PersistenceException) {
				logger.debug("PersistenceException:" + JSON.stringify(error.getErrors(), null, 2));
			}

			if(error instanceof ValidationException) {
				logger.debug("ValidationException:" + JSON.stringify(error.getErrors(), null, 2));
			}

		});
}

catCreate({
	 backGroundImage	: "nopath",
	 name							: "Air To Air",
	 isVisible				: true
 });
 
 catCreate({
	 backGroundImage	: "nopath",
	 name							: "AirVus News",
	 isVisible				: true
 });

 