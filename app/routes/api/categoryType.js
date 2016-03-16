var CategoryType = require('../../persistence/crud/categorytype');

function post(req, res) {
  CategoryType
  .create(req.body)
  .then(function(category) {
    res.send(category);
  })
}

function get(req, res) {
  CategoryType
  .get()
  .then(function(categories) {
    res.send(categories);
  })
}

function getById(req, res) {

}

function put(req, res) {

}

function del(req, res) {

}

module.exports = {
  post: post,
  get: get,
  getById: getById,
  put: put,
  del: del
};