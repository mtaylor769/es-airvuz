var namespace = 'app.routes.apiVersion.categoryType1-0-0';

try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var catTypeCrud1_0_0 = require('../../persistence/crud/categoryType1-0-0');
    var _ = require('lodash');

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
function CategoryType() {
}
/**
 * route: POST /api/category-type
 * @param req
 * @param res
 */
function post(req, res) {
    catTypeCrud1_0_0
        .create(req.body)
        .then(function (category) {
            res.send(category);
        })
}
/**
 * route: GET /api/category-type
 * @param req
 * @param res
 */
function get(req, res) {
    catTypeCrud1_0_0
        .get()
        .then(function (categories) {
            res.send(categories);
        })
}

/**
 * return a new array of categories without the argument "name" category
 * @param categories
 * @param name
 * @returns {Array}
 * @private
 */
function _rejectCategory(categories, name) {
    return _.reject(categories, function (category) {
        return category.name === name;
    });
}
/**
 * route: GET /api/category-type/by-roles
 * @param req
 * @param res
 */
function getByRoles(req, res) {
    var roles = req.user.aclRoles;

    catTypeCrud1_0_0
        .get()
        .then(function (categories) {
            if (roles.indexOf('user-root') === -1 && roles.indexOf('root') === -1) {
                if (roles.indexOf('user-news') === -1) {
                    categories = _rejectCategory(categories, 'AirVūz News');
                }
                if (roles.indexOf('user-instagram') === -1) {
                    categories = _rejectCategory(categories, 'AirVūz Instagram');
                }
                if (roles.indexOf('user-originals') === -1) {
                    categories = _rejectCategory(categories, 'AirVūz Originals');
                }
            }
            res.json(categories);
        })
        .catch(function () {
            res.sendStatus(500);
        });
}
/**
 * route: GET /api/category-type/:id
 * @param req
 * @param res
 */
function getById(req, res) {
    catTypeCrud1_0_0
        .getById(req.params.id)
        .then(function (category) {
            res.send(category);
        })
}
/**
 * route: PROTECTED PUT /api/category-type/:id
 * @param req
 * @param res
 */
function put(req, res) {
    catTypeCrud1_0_0
        .update({id: req.body._id, update: req.body})
        .then(function (category) {
            res.send(category);
        })
}
/**
 * route: PROTECTED DELETE /api/category-type/:id
 * @param req
 * @param res
 */
function deleteCat(req, res) {
    catTypeCrud1_0_0
        .remove(req.params.id)
        .then(function () {
            res.sendStatus(200);
        })
}

CategoryType.prototype.post = post;
CategoryType.prototype.get = get;
CategoryType.prototype.getByRoles = getByRoles;
CategoryType.prototype.getById = getById;
CategoryType.prototype.put = put;
CategoryType.prototype.delete = deleteCat;

module.exports = new CategoryType();