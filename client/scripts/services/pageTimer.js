/* global fbq */
(function(window, document) {
    var AVEventTracker = require('../../scripts/avEventTracker'),
        PubSub = require('pubsub-js'),
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
            eventName: 'page-timer',
            referrer: document.referrer
        };

        switch (minutes) {
            case '1:0':
                evtObj.timeOnSite = '1';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'timeOnSite:1min');
                break;
            case '1:30':
                evtObj.timeOnSite = '1.5';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'timeOnSite:1.5min');
                break;
            case '2:0':
                evtObj.timeOnSite = '2';
                var secondVist = localStorage.getItem('2ndVisitLogin') || 0;

                secondVist++;

                if (secondVist === 2) {
                  PubSub.publish('prompOptLogin');
                }

                if (secondVist < 3) {
                    localStorage.setItem('2ndVisitLogin', secondVist);
                }
                break;
            case '2:30':
                evtObj.timeOnSite = '2.5';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'timeOnSite:2.5min');
                break;
            case '3:0':
                evtObj.timeOnSite = '3';
                if (window.sessionStorage.getItem('opened') === null) {
                    PubSub.publish('prompOptLogin');
                }
                break;
            case '4:30':
                evtObj.timeOnSite = '4.5';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'timeOnSite:4.5min');
                break;
            case '10:0':
                stopTimer = true;
                window.localStorage.setItem('endTime', new Date().getTime());

                evtObj.timeOnSite = '10';
                AVEventTracker(evtObj);
                fbq('trackCustom', 'timeOnSite:10min');
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