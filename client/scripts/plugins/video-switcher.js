/*
 * jQuery plugin - Video switcher
 */

(function ($, window) {
    var PubSub          = require('pubsub-js');
    var amazonConfig    = require('../config/amazon.config.client');

    var pluginName = 'switchVideo',
        defaults = {
            propertyName: 'value'
        };

    /*
     * Constructor
     * @params      {element}   el                          - the selected video
     * @property    {object}    options                     - optional params
     * @property    {string}    options.selectedVideoId     - the selected video id
     * @property    {string}    options.ccid    - the custom category id video is part of
     */
    var Plugin = function (el, options) {
        this.element = el;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        if (this.element.getAttribute('data-id') === '') {
            throw 'Selected video data-id is required';
        }

        this.init();
    };

    Plugin.prototype = {
        // initialize
        init: function () {
            this._cache();
            this._getVideoData();
        },
        // cache the dom node
        _cache: function () {
            this.$element = $(this.element);
        },
        // get the video data
        _getVideoData: function () {
            var _this = this,
                selectedVideoId = this.options.selectedVideoId,
                ccid = typeof this.options.ccid !== 'undefined' && this.options.ccid.length ? this.options.ccid : '';

            $.ajax({url: '/api/videos/' + selectedVideoId + (ccid.length ? '?ccid:' + ccid : '')})
                .then(function (resp) {
                    require(['moment'], function (moment) {
                        resp.displayDate = moment(resp.uploadDate).fromNow();
                        resp.openGraphCacheDate = moment(resp.openGraphCacheDate).format('x');
                        if(resp.title.length > 45) {
                            resp.title = resp.title.substring(0, 45) + '...';
                        }

                        if (ccid.length) {
                            resp.ccid = ccid;
                        }
                        _this._updateVideoSrc(resp);
                    });
                });
        },
        // update the video src
        _updateVideoSrc: function (data) {
            var _this = this,
                $body = $('body'),
                video = $body.find('video')[0];

            PubSub.publish('video-switched', data);

            video.pause();
            video.src = amazonConfig.OUTPUT_URL + data.videoPath;
            video.poster = amazonConfig.OUTPUT_URL + data.thumbnailPath;

            $body.animate({scrollTop: 0}, 'fast');

            _this._updateUrl(data);

            // ensure the video has enough data to start playing
            try {
                if (video.readyState === 4) {
                    video.play();
                }
            } catch(err) {}

            _this.destroy();
        },
        // update page url
        _updateUrl: function (data) {
            var ccidQueryParam = typeof this.options.ccid !== 'undefined' && this.$element.data('ccid').length ? '?ccid=' + this.$element.data('ccid') : '';

            window.history.pushState({}, 'Airvuz - ' + data.title, '/video/' + this.$element.attr('data-id') + ccidQueryParam);
        },
        // remove the plugin instance
        destroy: function () {
            this.$element.removeData();
        }
    };

    // A lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function() {
           if (!$.data(this, 'plugin_' + pluginName)) {
               $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
           }
        });
    }

}(jQuery, window));