var mongoose = require('mongoose'),
  userCrud = require('../app/persistence/crud/users'),
  acl;

var DATABASE = {
  HOST : "localhost",
  NAME : "AirVuzV2"
};

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://' + DATABASE.HOST + '/' + DATABASE.NAME);

require('../app/persistence/model/users');

function createRootUser() {
  var Root = {
    aclRoles: ['root'],
    emailAddress: 'root@airvuz.com',
    firstName: 'root',
    lastName: 'airvuz',
    password: '2016AVaDMin',
    userName: 'root'
  };

  return userCrud.create(Root)
    .then(function (user) {
      return acl.addUserRoles(user._id, 'root');
    });
}

function createAdminUser() {
  var Admin = {
    aclRoles: ['user-admin'],
    emailAddress: 'admin@airvuz.com',
    firstName: 'admin',
    lastName: 'airvuz',
    password: '2016AVaDMin',
    userName: 'admin'
  };

  return userCrud.create(Admin)
    .then(function (user) {
      return acl.addUserRoles(user._id, 'user-admin');
    });
}

function createGeneralUser() {
  var General = {
    aclRoles: ['user-general'],
    emailAddress: 'user@airvuz.com',
    firstName: 'user',
    lastName: 'airvuz',
    password: '2016AVaDMin',
    userName: 'userAirvuz'
  };

  return userCrud.create(General)
    .then(function (user) {
      return acl.addUserRoles(user._id, 'user-general');
    });
}

function closeDatabaseConnection() {
  mongoose.connection.close();
  console.log('******************** close database connection ********************');
}

function setPermission() {
  return acl.allowArray([
    {
      roles: ['root'],
      allows: [
        {
          resources: ['comment'],
          permissions : ['*']
        },
        {
          resources: ['report'],
          permissions : ['*']
        },
        {
          resources: ['user'],
          permissions : ['*']
        },
        {
          resources: ['video'],
          permissions : ['*']
        }
      ]
    },
    {
      roles: ['user-general'],
      allows: [
        {
          resources: ['user'],
          permissions: ['delete', 'edit', 'view']
        },
        {
          resources: ['video'],
          permissions: ['create', 'delete', 'edit', 'view']
        }
      ]
    },
    {
      roles: ['user-contributor'],
      allows: [
        {
          resources: ['user'],
          permissions: ['edit']
        }
      ]
    },
    {
      roles: ['user-root'],
      allows: [
        {
          resources: ['user'],
          permissions: ['create', 'delete', 'edit', 'view']
        }
      ]
    },
    {
      roles: ['user-admin'],
      allows: [
        {
          resources: ['user'],
          permissions: ['edit', 'hide', 'show', 'view']
        }
      ]
    },
    {
      roles: ['video-root'],
      allows: [
        {
          resources: ['video'],
          permissions: ['create', 'delete', 'edit', 'hide', 'show', 'view']
        }
      ]
    },
    {
      roles: ['video-admin'],
      allows: [
        {
          resources: ['video'],
          permissions: ['create', 'edit', 'hide', 'show', 'view']
        }
      ]
    },
    {
      roles: ['comment-root'],
      allows: [
        {
          resources: ['comment'],
          permissions: ['delete', 'edit']
        }
      ]
    },
    {
      roles: ['report-root'],
      allows: [
        {
          resources: ['report'],
          permissions: ['*']
        }
      ]
    },
    {
      roles: ['report-admin'],
      allows: [
        {
          resources: ['report'],
          permissions: [/*'search-users', 'search-videos',*/ 'view-user-report', 'view-video-report']
        }
      ]
    },
    {
      roles: ['report-user'],
      allows: [
        {
          resources: ['report'],
          permissions: ['view-user-report']
        }
      ]
    },
    {
      roles: ['report-video'],
      allows: [
        {
          resources: ['report'],
          permissions: ['view-video-report']
        }
      ]
    },
    {
      roles: ['sliders-root'],
      allows: [
        {
          resources: ['sliders'],
          permissions: ['create', 'edit', 'delete']
        }
      ]
    }
  ]);
}

mongoose.connection.once('connected', function() {
  console.log('******************** connected to database ********************');

  acl = require('../app/utils/acl');

  setPermission()
    .then(createRootUser)
    .then(createAdminUser)
    .then(createGeneralUser)
    .catch(function (err) {
      console.log('******************** err ********************');
      console.log(err);
      console.log('************************************************');
    })
    .finally(closeDatabaseConnection);
});