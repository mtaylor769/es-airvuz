var appConfig = require('../config/application.config.client');
var GoogleMapsLoader = require('google-maps');
var GoogleMapService = {};

/*
 * Configuration
 */
GoogleMapsLoader.KEY = appConfig.google.googleMapsKey;
GoogleMapsLoader.LANGUAGE = 'en';
GoogleMapsLoader.REGION = '';
GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];

var longitude = -94.636230,
    latitude = 46.392410,
    disableGeocoding = false,
    mapPlaceHolder = null,
    map = null,
    mapMarkers = [],
    coords = {},
    infoWindow,
    geocoder,
    places,
    mapParams,
    videoId;

/*
 * initialize the map
 * @params {Object}  params
 * @params {Element} params.dom - the div element where the map will be placed at
 * @params {Boolean} params.editMode - map in edit mode (defaults to false)
 */
function init(params) {
    mapParams = setMapParams(params);

    if (!mapParams.mapDom) {
        throw new Error('Map Dom is not found');
    } else {
        mapPlaceHolder = mapParams.mapDom;
    }

    GoogleMapsLoader.load(function() {
        _loadMap();

        $('.loading-comment-spinner').show();

        if (mapParams.editMode) {
            get(videoId)
                .then(function(resp) {
                    // Handle the created video with location coords (ref to New videos or videos with default coords: [-150, 0])
                    if (typeof resp.loc !== 'undefined') {
                        $('.loading-comment-spinner').hide();
                        disableGeocoding = true;

                        mapParams.hasCoords = true;
                        mapParams.hasDefaultCoords = resp.loc.coordinates.join('') === "-1500" ? true : false;

                        if (!mapParams.hasDefaultCoords) {
                            updateMap(resp.loc.coordinates);
                        } else {
                            disableGeocoding = false;
                        }

                        _setInfoWindow({
                            formatted_address: resp.loc.address,
                            place_id: resp.loc.googlePlaceId
                        });
                    // Handle the video without location coords (ref to Old videos)
                    } else {
                        _getCurrentVideoCoords();
                    }
                })
                .fail(function(err) {
                    console.log('There was an error getting the video coordinates.');
                });
        } else {
            _getCurrentVideoCoords();
        }
    });
}

/*
 * get the users current GPS coordinates
 * @private
 */
function _getCurrentVideoCoords() {
    _getCurrentCoordinates()
        .then(function(params) {
            mapParams.gpsEnabled = true;
            disableGeocoding = false;
            updateMap(params);
        })
        .fail(function(err) {
            var string = '&nbsp; ' + err.message + '&nbsp; Click on map to pinpoint where the video was recorded.';

            _displayErrorMsg(true, string);

            mapParams.gpsEnabled = false;
        })
        .always(function() {
            $('.loading-comment-spinner').hide();
        });
}

/*
 * load the google map
 * @private
 * @params {Object} [posObj] - the current location coords (lng, lt)
 * @descriptions - when map is initially loaded, it will be center to the United States lng/lt
 */
function _loadMap() {
    var options = {
        scrollwheel: false,
        center: {lat: 37.09024, lng: -95.712891},
        streetViewControl: false,
        mapTypeControl: false,
        zoom: 4
    };

    map = new google.maps.Map(mapPlaceHolder, options);

    _loadLibraries();

    _bindEvents();
}

/*
 * @private
 * @params {Object}
 * @description set the mapparam object
 */
function setMapParams(params) {
    return {
        mapDom: params && params.dom || undefined,
        editMode: params && params.editMode || false,
        hasDefaultCoords: params && params.hasDefaultCoords || false,
        hasCoords: params && params.hasCoords || false,
        gpsEnabled: false
    };
}

/*
 * load Google Map libraries
 * @private
 */
function _loadLibraries() {
    infoWindow = new google.maps.InfoWindow({pixelOffset:new google.maps.Size(0, 0), maxWidth: 300});    // TODO: extract to own setInfoWindow()
    geocoder = new google.maps.Geocoder();
    places = new google.maps.places.PlacesService(map);
}

/*
 * @private
 * map events
 */
function _bindEvents() {
    var locationTxBx = document.getElementById('location'),
        autoComplete = new google.maps.places.Autocomplete(locationTxBx);

    locationTxBx.addEventListener('keyup', function () {
        $('#location-update').hide();
    });

    map.addListener('click', function(e) {
        // For videos that have no coords or have default coords, reset to allow location text update
        mapParams.hasCoords = true;
        mapParams.hasDefaultCoords = false;

        disableGeocoding = false;
        _placeMarker(e.latLng);
    });

    autoComplete.bindTo('bounds', map);

    autoComplete.addListener('place_changed', function(e) {
        var place = autoComplete.getPlace();

        if (!place.geometry) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
        }

        _setInfoWindow(place);

        _placeMarker(place.geometry.location);

        $('#location-list').hide();
    });

    if (mapParams.editMode) {
        setTimeout(function() {
            _locationSearchSuggestions();
        }, 500);
    }
}

/*
 * @private
 * @description
 */
function _locationSearchSuggestions() {
    var location = $('#location').val();

    places.textSearch({query: location}, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            _showLocationLists(results);
        } else if (status === 'ZERO_RESULTS') {
            _displayErrorMsg(true, '&nbsp; Found 0 results based on the location provided. Please click on the map to choose your location.');
        } else {
            _displayErrorMsg(false, '&nbsp; Geocode was not successful for the following reason: ' + status);
        }
    });
}

/*
 * @private
 * @description show a list of suggested locations
 */
function _showLocationLists(params) {
    var obj = {};
    var $locList = $('#location-list');
    if (params.length) {
        $locList.removeClass('hidden');

        for(var i = 0; i < params.length; i++) {
            obj.placeId = params[i].place_id;
            obj.coords = {
                lat: params[i].geometry.location.lat(),
                lng: params[i].geometry.location.lng()
            };
            $locList.find('#updated-location-lists').append("<span class='tag label label-info' data-object="+JSON.stringify(obj)+">"+params[i].formatted_address+"</span>");
        }
    } else {
        $locList.addClass('hidden');
    }
}

/*
 * reverse geocode
 * @private
 * @description convert a lat/lng coordinates into a formatted address
 */
function _reverseGeoCode(pos) {
    var callback = function(resp) {
        if (resp && resp.length > 0) {
            updateLocation(resp[0].formatted_address);
            _setInfoWindow(resp[0]);
        } else {
            updateLocation('');
        }
    };

    geocoder.geocode({
        latLng: pos
    }, callback);
}

/*
 * update the location textbox
 * @private
 * @param {Boolean} [param.editMode]
 * @description will only update the location textbox if map is in edit mode
 */
function updateLocation(param) {
    if (mapParams.editMode && (!mapParams.hasCoords && !mapParams.hasDefaultCoords) || (!mapParams.hasCoords && mapParams.hasDefaultCoords)) {
        return;
    }

    $('#location').val(param);
}

/*
 * @description place marker on map and pan to location
 */
function _placeMarker(latLng) {
    _clearMapMarkers();
    _hideInfoWindow();

    var marker = new google.maps.Marker({
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: latLng,
        map: map
    });

    map.panTo(latLng);
    map.setCenter(marker.getPosition());
    map.setZoom(12);

    if (!disableGeocoding) {
        _reverseGeoCode(latLng);
    }

    mapMarkers.push(marker);

    marker.addListener('dragstart', function() {
        _hideInfoWindow();
    });

    marker.addListener('dragend', function() {
        mapParams.hasCoords = true;
        mapParams.hasDefaultCoords = false;

        showInfoWindow(marker);
        _reverseGeoCode(marker.getPosition());

    });

    setTimeout(function() {
        showInfoWindow(marker);
    }, 600);

    if (!mapParams.hasCoords) {
        _displayErrorMsg(true, '&nbsp;Video does not have a location on the map. Defaulting to your current location.');
    }
}

/*
 * @description show infowindow contents
 * @params {Object} [evt]
 */
function showInfoWindow(marker) {
    var coords = {
        lat: marker.getPosition().lat(),
        lng: marker.getPosition().lng()
    };
    infoWindow.setPosition(coords);

    infoWindow.open(map, marker);
}

/*
 * @description hide infowindow
 */
function _hideInfoWindow() {
    infoWindow.close();
}

/*
 * @description set infowindow contents
 */
function _setInfoWindow(params) {
    var stringLoc = '<div><strong>' + params.formatted_address + '</strong></div>';

    _setMarkerCooordinates({
        address: params.formatted_address,
        placeId: params.place_id
    });

    infoWindow.setContent(stringLoc);
}

/*
 * @params {Object/Array} [pos] the long/lat object
 * @description update marker position
 */
function updateMap(pos) {
    if (typeof pos !== 'undefined') {
        if (pos instanceof Array) {
            longitude = pos[0];
            latitude = pos[1];
        } else {
            latitude = pos.coords.latitude;
            longitude = pos.coords.longitude;
        }
    }

    _placeMarker({lat: latitude, lng: longitude});
}

/*
 * get current location coordinates
 * @private
 * @returns a promise {position object}
 */
function _getCurrentCoordinates() {
    var dfd = $.Deferred(),
        options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        };

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(dfd.resolve, dfd.reject, options);
    } else {
        _displayErrorMsg(false);
    }

    return dfd.promise();
}

/*
 * set marker coordinates
 * @params {Object}
 */
function _setMarkerCooordinates(params) {
    $.extend(coords, params);
}

/*
 * get marker coordinates
 * @return {Object}
 */
function getMarkerCoordinates() {
    if (mapMarkers.length === 0) {
        coords.lat = latitude;
        coords.lng = longitude;
    } else {
        coords.lat = mapMarkers[0].getPosition().lat();
        coords.lng = mapMarkers[0].getPosition().lng();
    }
    return coords;
}

/*
 * remove all map markers
 * @private
 */
function _clearMapMarkers() {
    for (var i = 0; i < mapMarkers.length; i++) {
        mapMarkers[i].setMap(null);
    }
    mapMarkers.length = 0;
}

/*
 * display error message
 * @private
 * @params {Boolean} hasGeo
 * @params {String} msg
 */
function _displayErrorMsg(hasGeo, msg) {
    var $mapAlert = $('#map-alert');
    var message = hasGeo ? msg : 'Your browser doesn\'t support Geolocation. Click on map to pinpoint where the video was recorded.';
    $mapAlert.removeClass('hidden');
    $mapAlert.find('.warning-msg').html(message);
    $('.loading-comment-spinner').hide();
}

/*
 * reload the map
 */
function reload() {
    if (typeof google !== 'undefined') {
        google.maps.event.trigger(map, 'resize');
    }
}

/*
 * check if map contains markers
 * @return {Boolean}
 */
function hasMarkerOnMap() {
    return mapMarkers.length > 0;
}

/*
 * get the map
 * @params {Number} [videoId]
 * @returns Promise
 */
function get(videoId) {
    var dfd = $.Deferred();
    $.ajax({
        type: 'GET',
        url: '/api/videos/'+videoId+'/location',
        success : function(resp) {
            dfd.resolve(resp);
        },
        error: function (err) {
            dfd.reject(err);
        }
    });

    return dfd.promise();
}

/*
 * set the videoId
 * @params {Number} [id]
 */
function setVideoId(id) {
    videoId = id;
}

GoogleMapService.init = init;
GoogleMapService.get = get;
GoogleMapService.setVideoId = setVideoId;
GoogleMapService.getMarkerCoordinates = getMarkerCoordinates;
GoogleMapService.reload = reload;
GoogleMapService.hasMarkerOnMap = hasMarkerOnMap;
GoogleMapService.updateMap = updateMap;

module.exports = GoogleMapService;