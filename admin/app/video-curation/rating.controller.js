(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('ratingController', ratingController);

    ratingController.$inject = ['$http', 'Videos', 'Amazon'];

    function ratingController($http, Videos, Amazon) {
        // settings for rating stars
        var $one = $('.one'),
            $two = $('.two'),
            $three = $('.three'),
            $four = $('.four'),
            $five = $('.five');

        function clearSelected() {
            $('.rating-star').removeClass('selected');
        }

        function clearSelection() {
            vm.ratingSelection = 0;
            $('.rating-star').removeClass('selection');
        }

        function getVideoSource() {
            var videoConfigObj = {};
            videoConfigObj.videoSource = '//s3-us-west-2.amazonaws.com/' + Amazon.outputBucket + '/' + vm.video.videoPath;
            videoConfigObj.posterSource = '//s3-us-west-2.amazonaws.com/' + Amazon.outputBucket + '/' + vm.video.thumbnailPath;
            return videoConfigObj;
        }

        function setVideoPlayerConfig() {
            var config = getVideoSource();
            vm.mediaObj = {};

            vm.mediaObj.sources = [
                {
                    src: config.videoSource,
                    type: 'video/mp4'
                }
            ];

            vm.mediaObj.poster = config.posterSource;
        }

        //query for keyword populate
        function getKeywords(keywordInput) {
            var data = {};
            data.searchKeyword = new RegExp(keywordInput, 'i');
            return $http.get('/api/keyword', {params: {keyword: keywordInput}})
                .then(function (keywords) {
                    var setField =  $.map(keywords.data, function (keyword) {
                        return {text: keyword.keyword};
                    });
                    return setField;
                })
        }

        //get video by id
        function userInputVideo(userInputId) {
            Videos.get({id: userInputId})
                .$promise
                .then(function(video) {
                    vm.video = video;
                    vm.keywords = video.tags;
                    vm.userInputId = '';
                    clearSelection();
                    setVideoPlayerConfig();
                })
                .catch(function(error) {
                    vm.userInputError = true;
                })
        }

        //save current video and get next one
        function updateVideoAndGetNext(video) {
            if(vm.video) {
                var data = {};
                data.internalTags = vm.internalKeywords;
                data.videoId = vm.video._id;
                data.internalRanking = vm.ratingSelection;
                if(!data.internalRanking) {
                    vm.ratingRequired = true;
                } else {
                    $http.post('/api/video-curation', data).then(function(response) {
                        var video = response.data[0];
                        vm.video = video;
                        vm.keywords = video.tags;
                        vm.internalKeywords = video.internalTags;
                        vm.ratingRequired = false;
                        clearSelection();
                        setVideoPlayerConfig();
                    })
                }
            } else {
                var data = {};
                data.initialVideo = true;
                $http.post('/api/video-curation', data).then(function(response) {
                    var video = response.data[0];
                    vm.video = video;
                    vm.keywords = video.tags;
                    vm.ratingRequired = false;
                    setVideoPlayerConfig();
                })
            }
        }

        //set rating on click
        function setRating(starSelection) {
            switch (starSelection) {
                case 1:
                    $one.addClass('selection');
                    vm.ratingSelection = 1;
                    break;
                case 2:
                    $one.addClass('selection');
                    $two.addClass('selection');
                    vm.ratingSelection = 2;
                    break;
                case 3:
                    $one.addClass('selection');
                    $two.addClass('selection');
                    $three.addClass('selection');
                    vm.ratingSelection = 3;
                    break;
                case 4:
                    $one.addClass('selection');
                    $two.addClass('selection');
                    $three.addClass('selection');
                    $four.addClass('selection');
                    vm.ratingSelection = 4;
                    break;
                case 5:
                    $one.addClass('selection');
                    $two.addClass('selection');
                    $three.addClass('selection');
                    $four.addClass('selection');
                    $five.addClass('selection');
                    vm.ratingSelection = 5;
                    break;
                default:
                    break;

            }
        }

        $one.hover(function() {
            clearSelection();
            $one.addClass('selected');
            $(this).on('click', function() {
                setRating(1);
            })
        }, function() {
            clearSelected();
        });
        $two.hover(function() {
            clearSelection();
            $one.addClass('selected');
            $two.addClass('selected');
            $(this).on('click', function() {
                setRating(2);
            })
        }, function() {
            clearSelected();
        });
        $three.hover(function() {
            clearSelection();
            $one.addClass('selected');
            $two.addClass('selected');
            $three.addClass('selected');
            $(this).on('click', function() {
                setRating(3);
            })
        }, function() {
            clearSelected();
        });
        $four.hover(function() {
            clearSelection();
            $one.addClass('selected');
            $two.addClass('selected');
            $three.addClass('selected');
            $four.addClass('selected');
            $(this).on('click', function() {
                setRating(4);
            })
        }, function() {
            clearSelected();
        });
        $five.hover(function() {
            clearSelection();
            $one.addClass('selected');
            $two.addClass('selected');
            $three.addClass('selected');
            $four.addClass('selected');
            $five.addClass('selected');
            $(this).on('click', function() {
                setRating(5);
            })
        }, function() {
            clearSelected();
        });

        /////////////////////
        var vm = this;
        vm.getKeywords = getKeywords;
        vm.userInputVideo = userInputVideo;
        vm.updateVideoAndGetNext = updateVideoAndGetNext;
        vm.ratingSelection = null;


        updateVideoAndGetNext();
    }
})();