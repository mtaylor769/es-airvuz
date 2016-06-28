var CategoryTypeCrud  = require('../../persistence/crud/categoryType');
var _                 = require('lodash');

function CategoryType() {}

CategoryType.prototype.post = function(req, res) {
  CategoryTypeCrud
  .create(req.body)
  .then(function(category) {
    res.send(category);
  })
};

CategoryType.prototype.get = function(req, res) {
  CategoryTypeCrud
  .get()
  .then(function(categories) {
    res.send(categories);
  })
};

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

CategoryType.prototype.getByRoles = function(req, res) {
  var roles = req.user.aclRoles;

  CategoryTypeCrud
    .get()
    .then(function(categories) {
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
};

CategoryType.prototype.getById = function(req, res) {
  CategoryTypeCrud
  .getById(req.params.id)
  .then(function(category) {
    res.send(category);
  })
};

CategoryType.prototype.put = function(req, res) {
  CategoryTypeCrud
  .update({id: req.body._id, update: req.body})
  .then(function(category) {
    res.send(category);
  })
};

CategoryType.prototype.delete = function(req, res) {
  CategoryTypeCrud
  .remove(req.params.id)
  .then(function() {
    res.sendStatus(200);
  })
};

module.exports = new CategoryType();