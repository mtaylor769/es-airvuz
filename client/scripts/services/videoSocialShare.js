var AVEventTracker      = require('./../avEventTracker');
var identity            = require('./identity');
var amazonConfig        = require('./../config/amazon.config.client.js');
var browser             = require('./browser');
var dialog              = require('./dialogs');
var notificationObject  = {};
var video               = null;

/**
 * @param params {String}
 * @description add a class name to the parent element for styling purposes
 */
function addClass(className) {
    $('.social-icons').addClass(className);
}

/**
 * @param params {Boolean}
 * @description remove the icon color on hover
 */
function removeColorOnHover(isRemoved) {
    if (isRemoved) {
        $('.social-icons').children().removeClass('original-color-hover');
    } else {
        $('.social-icons').children().addClass('original-color-hover');
    }
}

/**
 * @param params {String}
 * @description set the size of the icons (sm or md)
 *
 */
function setIconFontSize(size) {
    $('.social-icons').children().addClass('icon-' + size);
}

// embed click handler
function embedClickHandler() {
    var iframeUrl = "<code>&lt;iframe src='https://www.airvuz.com/videoPlayerEmbed/" +video._id + " height='245' width='432'&gt;&lt;/iframe&gt;</code>";

    dialog.setSize('md');

    dialog.open({
        title: 'Video Iframe Code',
        body: iframeUrl,
        html: true,
        showOkay: false
    }).then(function () {
    });
    notificationObject.notificationType = 'SOCIAL-MEDIA-SHARE-EMBEDED';
    notificationObject.notifiedUserId  = video.userId;
    notificationObject.notificationMessage = 'embeded your video';
    notificationObject.videoId = video._id;
    if(identity.isAuthenticated()) {
        notificationObject.actionUserId = identity._id;
    }
    $.ajax({
        type: 'POST',
        url: '/api/notifications',
        data: notificationObject
    })
        .done(function(response) {
            fbq('trackCustom', 'social-share-embed');
            ga('send', 'event', 'video page', 'video-embedded-share', video._id);
            AVEventTracker({
                codeSource: "videoPlayer",
                eventName: "video-embedded-share",
                eventType: "browser",
                userId: getUserId(),
                videoId: video._id,
                eventSource: browser.isMobile() ? 'mobile' : ''
            });
        })
        .fail(function(error) {
        });
}

// facebook icon click handler
function fbClickHandler(e) {
    e.preventDefault();
    FB.ui(
        {
            method: 'feed',
            name: video.name,
            link: window.location.href,
            picture: 'http://s3-us-west-2.amazonaws.com/' + amazonConfig.OUTPUT_BUCKET + '/'+video.thumbnailPath,
            description: video.description,
            message: ""
        },
        function(response) {
            notificationObject.notificationType = 'SOCIAL-MEDIA-SHARE-FACEBOOK';
            notificationObject.notificationMessage = 'shared your video on Facebook';
            notificationObject.notifiedUserId  = video.userId;
            notificationObject.videoId = video._id;
            if(identity.isAuthenticated()) {
                notificationObject.actionUserId = identity._id;
            }
            if(response.post_id) {
                $.ajax({
                    type: 'POST',
                    url: '',
                    data: notificationObject
                })
                    .done(function(response) {
                        fbq('trackCustom', 'social-share-facebook');
                        ga('send', 'social', 'facebook', 'share', window.location.href);
                        ga('send', 'event', 'video page', 'facebook-share', 'sharing video');
                        AVEventTracker({
                            codeSource: "videoPlayer",
                            eventName: "facebook-share",
                            eventType: "browser",
                            userId: getUserId(),
                            eventSource: browser.isMobile() ? 'mobile' : ''
                        });
                    })
                    .fail(function(error) {
                    });
            }
        }
    );
}

// twitter icon click handler
function twitterClickHandler() {
    notificationObject.notificationType = 'SOCIAL-MEDIA-SHARE-TWITTER';
    notificationObject.notificationMessage = 'shared your video on Twitter';
    notificationObject.videoId = video._id;
    notificationObject.notifiedUserId  = video.userId;
    if(identity.isAuthenticated()) {
        notificationObject.actionUserId = identity._id;
    }
    $.ajax({
        type: 'POST',
        url: '/api/notifications',
        data: notificationObject
    })
        .done(function(response) {
            fbq('trackCustom', 'social-share-twitter');
            ga('send', 'social', 'twitter', 'share', window.location.href);
            ga('send', 'event', 'video page', 'twitter-share', 'sharing video');
            AVEventTracker({
                codeSource: "videoPlayer",
                eventName: "twitter-share",
                eventType: "browser",
                userId: getUserId(),
                eventSource: browser.isMobile() ? 'mobile' : ''
            });
        })
        .fail(function(error) {
        })
}

// google icon click handler
function googleClickHandler() {
    notificationObject.notificationType = 'SOCIAL-MEDIA-SHARE-GOOGLEPLUS';
    notificationObject.notificationMessage = 'shared your video on Google Plus';
    notificationObject.videoId = video._id;
    notificationObject.notifiedUserId  = video.userId;
    if(identity.isAuthenticated()) {
        notificationObject.actionUserId = identity._id;
    }
    $.ajax({
        type: 'POST',
        url: '/api/notifications',
        data: notificationObject
    })
        .done(function(response) {
            fbq('trackCustom', 'social-share-google');
            ga('send', 'social', 'google', 'share', window.location.href);
            ga('send', 'event', 'video page', 'google-share', 'sharing video');
            AVEventTracker({
                codeSource: "videoPlayer",
                eventName: "google-share",
                eventType: "browser",
                userId: getUserId(),
                eventSource: browser.isMobile() ? 'mobile' : ''
            });
        })
        .fail(function(error) {
        });
}

/*
 * get the authenticated user id
 * @return return the user id or null (anonymous)
 */
function getUserId() {
    return identity.isAuthenticated() ? identity._id : null;
}

/**
 *
 * @param params {Object}
 * @description initialize the event handler
 */
function initialize(videoObj) {
    video = videoObj;

    $('.social-icons')
        .on('click', '.embed', embedClickHandler)
        .on('click', '#facebook', fbClickHandler)
        .on('click', '#twitter', twitterClickHandler)
        .on('click', '#google', googleClickHandler);

    // init tooltip
    $('.social-icons').tooltip({
        selector: "[data-toggle='tooltip']"
    });
}

module.exports = {
    initialize: initialize,
    addClass: addClass,
    setIconFontSize: setIconFontSize,
    removeColorOnHover: removeColorOnHover
};