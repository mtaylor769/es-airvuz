/* global fbq */
(function(window) {
    var AVEventTracker = require('../../scripts/avEventTracker'),
        Timer = require('./Timer'),
        activeTabTimer = new Timer();

    /**
     * activeTabTimer
     * timer for active tab
     * time start on load
     * once the user go away the time stop
     * when user come back the time reset
     */
    activeTabTimer.start();

    /**
     * send event when the time hit these time
     */
    activeTabTimer
        .at('00:01:00', _trackActiveTimer)
        .at('00:01:30', _trackActiveTimer)
        .at('00:02:30', _trackActiveTimer)
        .at('00:04:30', _trackActiveTimer)
        .at('00:10:00', _trackActiveTimer);

    /**
     * track event to us, facebook, and google
     * @param _id
     * @param time
     * @private
     */
    function _trackActiveTimer(_id, time) {
        AVEventTracker({
            codeSource: 'pageTimer',
            eventType: 'browser',
            eventName: 'active-tab',
            data: {
                time: time
            }
        });
        fbq('trackCustom', 'active-tab:' + time);
        ga('send', 'event', 'active-tab', 'active-tab:' + time, 'active-tab');
    }

    function onInactive() {
        activeTabTimer.stop();
    }

    function onActive() {
        activeTabTimer.reset().start();
    }

    window.addEventListener('blur', onInactive);
    window.addEventListener('focus', onActive);
})(window);