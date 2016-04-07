require('../styles/index.css');

var test = require('./test');

exports.add = function (a, b) { return a+b };

$(document).ready(function() {
  alert('ready');
  console.log('<div class="flex">
    <textarea cols="80" rows="3" class="m-r-20" style="margin-bottom: 20px;"></textarea>
    <button class="btn background-orange border-radius-0 font-white" style="margin-bottom: 20px;">Submit</button>
    </div>')
});