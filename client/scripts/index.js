require('../styles/index.css');

var test = require('./test');

var a = "a";

exports.add = function (a, b) { return a+b };

$(document).ready(function() {
  alert('ready');
});