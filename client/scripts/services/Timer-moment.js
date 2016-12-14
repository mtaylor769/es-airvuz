var moment = require('moment');

/**
 * Timer with momentjs
 * @constructor
 */
function Timer() {
    this.counter = 0;
    this.isRunning = null;
}

function start() {
    if (this.isRunning === null) {
        this.isRunning = setInterval(function () {
            this.time = moment().hour(0).minute(0).second(this.counter++).format('HH:mm:ss');
        }.bind(this), 1000);
    }
}

function stop() {
    clearInterval(this.isRunning);
    this.isRunning = null;
}

function reset() {
    this.counter = 0;
}

function getTime() {
    return this.time;
}

Timer.prototype.start = start;
Timer.prototype.stop = stop;
Timer.prototype.reset = reset;
Timer.prototype.getTime = getTime;

module.exports = Timer;