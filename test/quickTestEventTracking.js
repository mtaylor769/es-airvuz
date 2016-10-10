
var log4js									= require('log4js');
var logger									= log4js.getLogger("test.quickTestEventTracking");

var EventTrackingCrud				= require('../app/persistence/crud/events/eventTracking');
var EventSource							= require('../app/persistence/crud/events/eventSource');
var EventType								= require('../app/persistence/crud/events/eventType');

var BaseException						= require('../app/utils/exceptions/BaseException');
var PersistenceException		= require('../app/utils/exceptions/PersistenceException');
var ValidationException			= require('../app/utils/exceptions/ValidationException');
var CategoryType						= require('../app/persistence/crud/categoryType1-0-0');

var createEvent = function(params) {
	
	EventTrackingCrud.create(params)
		.then(function() {
			logger.debug(".createEvent created");
		})
		.catch(function(error) {
			logger.error(".createEvent error:" + error);
		});
}

createEvent({
		eventSource : EventSource.nodejs,
		eventType		: EventType.createEvent
 });
 

 