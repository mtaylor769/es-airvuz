var io = require('socket.io-client'),
    Socket = {};

/**
 * start socket connection
 * require to be init so it doesn't run socket on every page that doesnt' need it
 * @returns {*}
 */
function init() {
  var socket = io.connect('/');

  if (IS_DEVELOPMENT) {
    socket.on('connect', function () {
      console.log('******************** Connect to socket ********************');
    });

    socket.on('disconnect', function () {
      console.log('******************** Disconnect from socket ********************');
    });
  }

  $(window).on('beforeunload', function () {
    socket.close();
  });

  return socket;
}

/////////////////////////////////////////////

Socket.init = init;

module.exports = Socket;