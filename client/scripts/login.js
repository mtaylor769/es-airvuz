document.addEventListener("DOMContentLoaded", function() {
   var emailAddress       = null;
   var password           = null;
   var userName           = null;
   function createUser() {
    password = document.getElementById("create-password");
    emailAddress = document.getElementById("create-email");
    userName = document.getElementById("create-username");

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/users/create', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var userInfo = JSON.parse(xhr.responseText);
        }
    };
    xhr.send(JSON.stringify({
        emailAddress    : emailAddress,
        userName        : userName,
        password        : password
    }));

   }

   function login() {

   }
});