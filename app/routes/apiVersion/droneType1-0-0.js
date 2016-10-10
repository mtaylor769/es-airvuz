var namespace = 'app.routes.apiVersion.droneType1-0-0';

try {
    var log4js              = require('log4js');
    var logger              = log4js.getLogger(namespace);
    var droneTypeCrud1_0_0  = require('../../persistence/crud/droneType1-0-0');

    if (global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

/**
 *
 * @constructor
 */
function DroneType() {

}
/**
 *
 * @param req
 * @param res
 */
function post(req, res) {
  droneTypeCrud1_0_0
    .create(req.body)
    .then(function(drone) {
      res.send(drone);
    })
    .catch(function(error) {
      res.send(error);
    })
}
/**
 *
 * @param req
 * @param res
 */
function get(req, res) {
  if(req.query.flag === 'all'){
    droneTypeCrud1_0_0
      .getAll()
      .then(function(drones) {
        res.send(drones)
      })
  } else {
    droneTypeCrud1_0_0
      .get()
      .then(function(drones) {
        res.send(drones);
      }) 
  }
}
/**
 *
 * @param req
 * @param res
 */
function getById(req, res) {
  droneTypeCrud1_0_0
    .getById(req.params.id)
    .then(function(drone) {
      res.send(drone);
    })
}
/**
 *
 * @param req
 * @param res
 */
function put(req, res) {
  droneTypeCrud1_0_0
    .update({id: req.body._id, update: req.body})
    .then(function(drone) {
      res.send(drone);
    })
}
/**
 *
 * @param req
 * @param res
 */
function deleteDroneType(req, res) {
  droneTypeCrud1_0_0
    .remove(req.params.id)
    .then(function() {
      res.sendStatus(200);
    })
}

DroneType.prototype.post = post;
DroneType.prototype.get = get;
DroneType.prototype.getById = getById;
DroneType.prototype.put = put;
DroneType.prototype.delete = deleteDroneType;

module.exports = new DroneType();