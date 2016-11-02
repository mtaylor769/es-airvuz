var namespace = 'app.routes.apiVersion.cameraType1-0-0';
try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var cameraTypeCrud1_0_0 = require('../../persistence/crud/cameraType1-0-0');

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
function CameraType() {
}
/**
 *
 * @param req
 * @param res
 */
function post(req, res) {
    cameraTypeCrud1_0_0
        .create(req.body)
        .then(function (camera) {
            res.send(camera);
        })
        .catch(function (error) {
            res.send(error);
        })
}
/**
 *
 * @param req
 * @param res
 */
function get(req, res) {
    console.log(req.query);
    if (req.query.flag === 'all') {
        cameraTypeCrud1_0_0
            .getAll()
            .then(function (cameras) {
                res.send(cameras);
            })
    } else {
        cameraTypeCrud1_0_0
            .get()
            .then(function (cameras) {
                res.send(cameras);
            })
    }
}
/**
 *
 * @param req
 * @param res
 */
function getById(req, res) {
    cameraTypeCrud1_0_0
        .getById(req.params.id)
        .then(function (camera) {
            res.send(camera);
        })
}
/**
 *
 * @param req
 * @param res
 */
function put(req, res) {
    cameraTypeCrud1_0_0
        .update({id: req.body._id, update: req.body})
        .then(function (camera) {
            res.send(camera);
        })
}
/**
 *
 * @param req
 * @param res
 */
function deleteCamType(req, res) {
    cameraTypeCrud1_0_0
        .remove(req.params.id)
        .then(function () {
            res.sendStatus(200);
        })
}

CameraType.prototype.post = post;
CameraType.prototype.get = get;
CameraType.prototype.getById = getById;
CameraType.prototype.put = put;
CameraType.prototype.delete = deleteCamType;

module.exports = new CameraType();