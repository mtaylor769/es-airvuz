/* global fbq */
(function(window, document) {
    var AVEventTracker = require('../../scripts/avEventTracker'),
        startTime = new Date().getTime(),
        stopTimer = false,
        minSec;

    function update() {
        var currentTime = window.localStorage.getItem('startTime'),
            endTime = new Date().getTime(),
            diff = endTime - currentTime,
            min = Math.floor(diff/60000),
            sec = Math.floor((diff/1000) % 60);

        minSec = min + ':' + sec;

        trackTime(minSec);

        if (!stopTimer) {
            timerId = setTimeout(update, 1000);
        }
    }

    function trackTime(minutes) {
        var evtObj = {
            codeSource: 'pageTimer',
            eventType: 'browser',
            referrer: document.referrer
        };

        switch (minutes) {
            case '1:0':
                evtObj.timeSpent = '1';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'TimeSpent:1min');
                break;
            case '1:30':
                evtObj.timeSpent = '1.5';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'TimeSpent:1.5min');
                break;
            case '2:30':
                evtObj.timeSpent = '2.5';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'TimeSpent:2.5min');
                break;
            case '4:30':
                evtObj.timeSpent = '4.5';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'TimeSpent:4.5min');
                break;
            case '10:0':
                stopTimer = true;
                window.localStorage.setItem('endTime', new Date().getTime());

                evtObj.timeSpent = '10';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'TimeSpent:10min');
                break;
        }
    }

    if (document.referrer.indexOf(location.protocol + "//" + location.host) !== 0) {
        stopTimer = false;

        window.localStorage.setItem('startTime', startTime);
        window.localStorage.removeItem('endTime');
    } else {
        if (window.localStorage.getItem('startTime') === null) {
            window.localStorage.setItem('startTime', startTime);
        }
    }

    if (window.localStorage.getItem('endTime') === null) {
        update();
    }

    window.addEventListener('beforeunload', function() {
        trackTime(minSec);
    });
})(window, document);