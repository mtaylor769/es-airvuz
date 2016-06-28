var category = {};

/**
 * get all category
 * @returns {Promise}
 */
function getAll() {
  return $.ajax({
    url         : '/api/category-type',
    type        : 'GET'
  });
}

/**
 * get category base on user roles
 * - require user to be login
 * @returns {Promise}
 */
function getByRoles() {
  return $.ajax({
    url         : '/api/category-type/by-roles',
    type        : 'GET'
  });
}

/////////////////////////////////////////////

category.getAll     = getAll;
category.getByRoles = getByRoles;

module.exports = category;