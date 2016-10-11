var mongoose 			= require('mongoose');

var usersSchema 		= mongoose.Schema({
    "confirmPassword" : String,
    "email" : String,
    "isSubscribeAirVuzNews" : Boolean,
    "password" : String,
    "userNameDisplay" : String
});

module.exports = mongoose.model('users', usersSchema);