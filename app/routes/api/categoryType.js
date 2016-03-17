var CategoryTypeCrud = require('../../persistence/crud/categorytype');

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