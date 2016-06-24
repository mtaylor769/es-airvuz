var CategoryTypeCrud = require('../../persistence/crud/categoryType');

function CategoryType() {

}

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

CategoryType.prototype.getUploadCategories = function(req, res) {
  var roles = req.query.aclRoles;
  CategoryTypeCrud
  .get()
  .then(function(categories) {
    if (roles.indexOf('user-root') === -1) {
      if (roles.indexOf('user-news') === -1) {
        for (var i = 0; i < categories.length; i++) {
          if (categories[i].name === 'AirVūz News') {
            categories.splice(i, 1);
          }
        }

      }
      if (roles.indexOf('user-instagram') === -1) {
        for (var i = 0; i < categories.length; i++) {
          if (categories[i].name === 'AirVūz Instagram') {
            categories.splice(i, 1);
          }
        }
      }
      if (roles.indexOf('user-originals') === -1) {
        for (var i = 0; i < categories.length; i++) {
          if (categories[i].name === 'AirVūz Originals') {
            categories.splice(i, 1);
          }
        }
      }
    }
    res.json(categories);
  })
    
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