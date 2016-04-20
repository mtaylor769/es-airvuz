$.ajaxSetup({
  beforeSend: function (xhr) {
    var token = localStorage.getItem('id_token');
    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  }
});