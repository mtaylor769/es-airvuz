var auth = {

  password        : null,
  email           : null,
  token           : null,
  username        : null,
  socialCreate    : false,

  createUser : function() {
    password    = $('#create-password').val();
    email       = $('#create-email').val();
    username    = $('#create-username').val();

    $.ajax({
      type: 'POST',
      url: '/api/users/create',
      data : {
        email           : email,
        username        : username,
        password        : password
      },
      success : function(data) {
        console.log('User created');
      }
    });
  },

  login : function() {
    password    = $('#login-password').val();
    email       = $('#login-email').val();
    $.ajax({
      type: 'POST',
      url: '/api/auth',
      data : {
        emailAddress    : email,
        password        : password
      },
      success : function(data) {
        console.log('login success');
      }
    })
  },

  socialCreateUser : function(token) {
    email       = $('#create-email').val();
    username    = $('#create-username').val();
    $.ajax({
      type: 'POST',
      url: '/api/users/create',
      data : {
        username        : username,
        token           : token,
        socialCreate    : true
      },
      success : function(data) {
        console.log('User created');
      }
    });
  }
};

module.exports = auth;
