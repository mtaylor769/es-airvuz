var auth = {
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
      success : function() {
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
      success : function() {
        console.log('login success');
      }
    })
  }
}

module.exports = auth;
