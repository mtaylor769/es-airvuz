var category = {};

function getAll() {
  return $.ajax({
    url         : '/api/category-type',
    type        : 'GET'
  });
}

/////////////////////////////////////////////

category.getAll = getAll;

module.exports = category;