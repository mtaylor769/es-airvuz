var video = require('../test/mockObjects/videos');
var videoCrud1_0_0 = require('../app/persistence/crud/videos1-0-0');
var mongoose = require('../mongoose');

videoCrud1_0_0.create(video);
