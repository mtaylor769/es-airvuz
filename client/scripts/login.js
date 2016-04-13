exports.login = {

  function createUser() {
    password    = document.getElementById("create-password").value;
    email       = document.getElementById("create-email").value;
    username    = document.getElementById("create-username").value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/users/create', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
          var userInfo = JSON.parse(xhr.responseText);
        }
    };
    xhr.send(JSON.stringify({
        email           : email,
        username        : username,
        password        : password
    }));

   }

  function login() {
    password    = document.getElementById("create-password").value;
    email       = document.getElementById("create-email").value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/auth', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
          var userInfo = JSON.parse(xhr.responseText);
        }
    };
    xhr.send(JSON.stringify({
        emailAddress           : email,
        password        : password
    }));
  }

}