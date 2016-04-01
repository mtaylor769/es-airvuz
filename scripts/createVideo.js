var video = require('../test/mockObjects/videos');
var videoCrud = require('../app/persistence/crud/videos');
var mongoose = require('../mongoose');

videoCrud.create(video);
