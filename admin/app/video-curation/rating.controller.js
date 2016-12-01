(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('ratingController', ratingController);

    ratingController.$inject = ['$http', 'Videos', 'Amazon', 'CategoryType', 'dialog', '$state', 'identity'];

    function ratingController($http, Videos, Amazon, CategoryType, dialog, $state, identity) {


        // settings for rating stars
        var $one = $('.one'),
            $two = $('.two'),
            $three = $('.three'),
            $four = $('.four'),
            $five = $('.five');

        //clears selected
        function clearSelected() {
            $('.rating-star').removeClass('selected');
        }

        //clears selection
        function clearSelection() {
            vm.ratingSelection = 0;
            $('.rating-star').removeClass('selection');
        }

        //gets video source for videojs config
        function getVideoSource() {
            var videoConfigObj = {};
            videoConfigObj.videoSource = '//s3-us-west-2.amazonaws.com/' + Amazon.outputBucket + '/' + vm.video.videoPath;
            videoConfigObj.posterSource = '//s3-us-west-2.amazonaws.com/' + Amazon.outputBucket + '/' + vm.video.thumbnailPath;
            return videoConfigObj;
        }

        //sets videojs config for video player
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
                    vm.showNextButtons = false;
                    vm.video = video;
                    vm.keywords = video.tags;
                    vm.internalKeywords = video.internalTags;
                    vm.seoKeywords = video.seoTags;
                    vm.primaryCategory = video.primaryCategory;
                    vm.videoNotes = video.videoNotes;
                    vm.ratingRequired = false;
                    if(video.curation) {
                        vm.curated = true;
                    } else {
                        vm.curated = false;
                    }
                    vm.userInputId = '';
                    clearSelection();
                    setVideoPlayerConfig();
                })
                .catch(function(error) {
                    vm.userInputError = true;
                })
        }


        function updateVideo() {
            var data = {};
            data.eventInfo = {};
            data.eventInfo.userId = identity.currentUser._id;
            data.eventInfo.videoId = vm.video._id;
            data.eventInfo.eventType = 'Video Curation Save';
            data.eventInfo.eventSource = 'Video Curation Admin';

            data.internalTags = vm.internalKeywords;
            data.seoKeywords = vm.seoKeywords;
            data.categories = vm.video.categories;
            data.videoId = vm.video._id;
            data.internalRanking = vm.ratingSelection;
            data.videoNotes = vm.videoNotes;
            if(vm.primaryCategory) {
                data.primaryCategory = vm.primaryCategory;
            }
            if(!data.internalRanking) {
                vm.ratingRequired = true;
            } else {
                $http.put('/api/video-curation', data).then(function(response) {
                    dialog.alert({
                        title: 'Video saved',
                        content: 'Video Info Successfully Saved',
                        ok: 'ok'
                    });
                    vm.showNextButtons = true;
                });
            }
        }

        //save current video and get next one
        function getNextVideo(nextVideoType) {
            if(vm.video) {
                var data = {};

                //current options nextVideoType === 'contributor' || 'category1' || 'category2' || 'category3'
                if(nextVideoType) {
                    data.nextVideoParams = {};

                    //gets value based on nextVideoType
                    data.nextVideoParams.value = getNextVideoValue(nextVideoType);

                    //if nextVideoType === 'category1' || 'category2' || 'category3' will set 'type' to category for backend code
                    if(nextVideoType.indexOf('category') > -1) {
                        data.nextVideoParams.type = 'category';
                    } else {
                        data.nextVideoParams.type = nextVideoType;
                    }
                }
                // will return for the next video based off initial params
                if(!nextVideoType && vm.curationType) {
                    data.nextVideoParams = {};
                    data.nextVideoParams.type = vm.curationType;
                }

                //function to get next video
                $http.post('/api/video-curation', data).then(function(response) {

                    // if no more videos available will display dialog and clear out page
                    if(response.data.completed === true) {
                        dialog.alert({
                            title: 'Completed',
                            content: 'There are no more videos available for the current user/category. Please enter a new video id to start a new set.',
                            ok: 'ok'
                        });
                        vm.video = {};
                        vm.curated = false;
                        clearSelection();
                        $state.go('videoCuration.landing');
                    } else {
                        vm.showNextButtons = false;
                        var video = response.data[0];
                        vm.video = video;
                        vm.keywords = video.tags;
                        vm.internalKeywords = video.internalTags;
                        vm.seoKeywords = video.seoTags;
                        vm.primaryCategory = video.primaryCategory;
                        vm.videoNotes = video.videoNotes;
                        vm.ratingRequired = false;
                        if(video.curation) {
                            vm.curated = true;
                        } else {
                            vm.curated = false;
                        }
                        clearSelection();
                        setVideoPlayerConfig();
                    }
                });

            } else {
                var data = {};
                data.initialVideo = true;
                if($state.params.videoId) {
                    data.stateVideo = $state.params.videoId;
                }
                if($state.params.type) {
                    vm.curationType = $state.params.type;
                    data.stateType = $state.params.type;
                }
                $http.post('/api/video-curation', data).then(function(response) {
                    if(response.data.length) {
                        var video = response.data[0];
                    } else {
                        var video = response.data;
                    }
                    vm.showNextButtons = false;
                    vm.video = video;
                    vm.internalKeywords = video.internalTags;
                    vm.seoKeywords = video.seoTags;
                    vm.primaryCategory = video.primaryCategory;
                    vm.keywords = video.tags;
                    vm.videoNotes = video.videoNotes;
                    vm.ratingRequired = false;
                    if(video.curation) {
                        vm.curated = true;
                    } else {
                        vm.curated = false;
                    }
                    setVideoPlayerConfig();
                });
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

        //event delegation for star hover
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

        //get all categories for select
        function getCategories() {
            return CategoryType.query()
              .$promise
              .then(function(categories) {
                  vm.categories = categories;
                  vm.primaryCategoryList = categories;
              })
        }

        //function to remove category from video, also adds back into select options
        function removeCategory(category) {
            var index = vm.video.categories.indexOf(category);
            var addCategory = vm.video.categories.splice(index, 1);
            vm.categoryType = '';
            if(vm.video.categories.length < 3) {
                vm.catLimitReached = false;
            }
        }

        //function to add category to video, also removes from select options
        function addCategory(category) {
            var categoryMatch = false;
            var category = JSON.parse(category);
            if(vm.video.categories.length < 3) {
                vm.video.categories.forEach(function(cat) {
                    if(cat._id === category._id) {
                        categoryMatch = true;
                    }
                });
                if(!categoryMatch) {
                    var newCategory = category;
                    vm.video.categories.push(newCategory);
                } else {
                    dialog.alert({
                        title: 'Category Selected',
                        content: 'This category has already been selected',
                        ok: 'ok'
                    })
                }
            } else {
                vm.catLimitReached = true;
            }
        }

        //gets value for specified getNextVideo 'type' get next video
        function getNextVideoValue(type) {
            switch(type) {
                case 'contributor':
                    return vm.video.userId;
                    break;
                case 'category1' :
                    return vm.video.categories[0]._id;
                    break;
                case 'category2' :
                    return vm.video.categories[1]._id;
                    break;
                case 'category3' :
                    return vm.video.categories[2]._id;
                    break;
                default :
                    return
            }
        }

        /////////////////////
        var vm = this;
        vm.getKeywords = getKeywords;
        vm.userInputVideo = userInputVideo;
        vm.updateVideo = updateVideo;
        vm.removeCategory = removeCategory;
        vm.addCategory = addCategory;
        vm.getNextVideo = getNextVideo;
        vm.ratingSelection = null;

        getCategories().then(function() {
            getNextVideo();
        });
    }
})();