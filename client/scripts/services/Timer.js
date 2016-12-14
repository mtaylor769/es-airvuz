var pubSub = require('pubsub-js');
/**
 * Timer
 * @constructor
 */
function Timer() {
    // unique-ish number
    this._id = (new Date()).getUTCMilliseconds();
    this.isRunning = null;
    this.subscribe = [];
}

function start() {
    this.currentTime = new Date();

    if (this.isRunning === null) {
        this.isRunning = setInterval(function () {
            this.time = this._msToHMS(new Date() - this.currentTime);
            if (this.subscribe.indexOf(this.time) > -1) {
                pubSub.publish(this._id + '-' + this.time, this.time);
            }
        }.bind(this), 1000);
    }

    return this;
}

function _msToHMS(ms) {
    var date = new Date(ms),
        seconds = date.getSeconds(),
        hours = date.getHours() - 18, // minus 18 hour - since it start at 18 hour
        minutes = date.getMinutes();

    return _pad(hours) + ':' + _pad(minutes) + ':' + _pad(seconds);
}

function _pad(n) {
    return ('0' + n).substr(-2);
}

function stop() {
    clearInterval(this.isRunning);
    this.isRunning = null;

    return this;
}

function reset() {
    this.currentTime = new Date();

    return this;
}

function getTime() {
    return this.time;
}

function at(time, cb) {
    this.subscribe.push(time);
    pubSub.subscribe(this._id + '-' + time, cb);

    return this;
}

Timer.prototype.start = start;
Timer.prototype.stop = stop;
Timer.prototype.reset = reset;
Timer.prototype.getTime = getTime;
Timer.prototype.at = at;
Timer.prototype._msToHMS = _msToHMS;

module.exports = Timer;