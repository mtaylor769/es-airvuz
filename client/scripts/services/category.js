var category = {};

function getAll() {
  return $.ajax({
    url         : '/api/category-type',
    type        : 'GET'
  });
}

function getUploadCategories(aclRoles) {
  var roles = {};
  roles.aclRoles = JSON.stringify(aclRoles);
  return $.ajax({
    url         : '/api/category-type/upload',
    type        : 'GET',
    data        : roles
  });
}

/////////////////////////////////////////////

category.getAll = getAll;
category.getUploadCategories = getUploadCategories;

module.exports = category;