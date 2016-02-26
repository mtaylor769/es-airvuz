global.NODE_ENV = process.env.NODE_ENV || 'development';
global.IS_PRODUCTION = NODE_ENV === 'production';
global.IS_DEVELOPMENT = NODE_ENV === 'development';
global.IS_NODE = true;

// Enable Mongoose
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECTION || 'mongodb://localhost/airvuz-2');

var path = require('path');
var express = require('express');

var app = express();

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.sourceManifest = require('../public/manifest.json');

//   __  __ _     _     _ _
//  |  \/  (_) __| | __| | | _____      ____ _ _ __ ___
//  | |\/| | |/ _` |/ _` | |/ _ \ \ /\ / / _` | '__/ _ \
//  | |  | | | (_| | (_| | |  __/\ V  V / (_| | | |  __/
//  |_|  |_|_|\__,_|\__,_|_|\___| \_/\_/ \__,_|_|  \___|
//

var compression = require('compression');
var morgan = require('morgan');


app.use(morgan('dev'));
app.use(compression());
app.use(express.static(path.resolve(__dirname, '../public')));

//      _    ____ ___   ____             _
//     / \  |  _ \_ _| |  _ \ ___  _   _| |_ ___ ___
//    / _ \ | |_) | |  | |_) / _ \| | | | __/ _ \ __|
//   / ___ \|  __/| |  |  _ < (_) | |_| | |_  __\__ \
//  /_/   \_\_|  |___| |_| \_\___/ \__,_|\__\___|___/
//

var api = require('./routes/api');

app.use('/api', api.router);

app.listen(process.env.PORT || 3000);