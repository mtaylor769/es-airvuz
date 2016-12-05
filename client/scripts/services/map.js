var appConfig = require('../config/application.config.client');
var GoogleMapsLoader = require('google-maps');
var GoogleMapService = {};

/*
 * Configuration
 */
GoogleMapsLoader.KEY = appConfig.google.googleMapsKey;
GoogleMapsLoader.LANGUAGE = 'en';
GoogleMapsLoader.REGION = '';
GoogleMapsLoader.LIBRARIES = ['geometry', 'places', 'drawing'];

var longitude = -94.636230, //long & lat defaults to MPLS if user location GPS is turned off
    latitude = 46.392410,
    locations = [],
    mapPlaceHolder = null,
    map = null,
    mapMarkers = [],
    infoWindow,
    geocoder,
    places,
    mapParams,
    disableGeocoding = false; // expose

/*
 * initialize the map
 * @params {Object}  params
 * @params {Element} params.dom - the div element where the map will be placed at
 * @params {Boolean} params.showCurrentLocation - show the user's current location on the map or not
 * @params {Boolean} params.editMode - map in edit mode (defaults to false)
 * @params {Boolean} params.enableDrawingMode
 */
function init(params) {
    console.log('initialize google maps...');

    var mapDom = params && params.dom || undefined,
        showCurrentLocation = params && params.showCurrentLocation || false,
        enableDrawingMode = params && params.enableDrawingMode || false,
        editMode = params && params.editMode || false;

    mapParams = params;

    if (!mapDom) {
        throw new Error('Map Dom is not found');
    } else {
        mapPlaceHolder = mapDom;
    }

    GoogleMapsLoader.load(function() {
        console.log('google maps load() ===> ');
        _loadMap();

        if (showCurrentLocation) {
            $('.loading-comment-spinner').show();
            _getCurrentCoordinates()
                .then(function(params) {
                    $('.loading-comment-spinner').hide();
                    updateMap(params);
                })
                .fail(function(err) {
                    var string = '&nbsp; ' + err.message + '&nbsp; Click on map to pinpoint where the video was recorded.';

                    _displayErrorMsg(true, string);
                });
        }
    });

    if (params.enableDrawingMode) {
        displayDrawingMode();
    }
}

/*
 * load the google map
 * @private
 * @params {Object} [posObj] - the current location coords (lng, lt)
 */
function _loadMap() {
    var options = {
        center: {lat: latitude, lng: longitude},
        streetViewControl: false,
        mapTypeControl: false,
        zoom: 8
    };

    map = new google.maps.Map(mapPlaceHolder, options);

    _loadLibraries();

    _bindEvents();

    // displayDrawingMode();
}

/*
 * load Google Map libraries
 * @private
 */
function _loadLibraries() {
    infoWindow = new google.maps.InfoWindow({pixelOffset:new google.maps.Size(0, 0), maxWidth: 300});    // TODO: extract to own setInfoWindow()
    geocoder = new google.maps.Geocoder();
    places = new google.maps.places.PlacesService(map);

    // TODO: load map and drawing lib
}

/*
 * @private
 * map events
 */
function _bindEvents() {
    var locationTxBx = document.getElementById('location'),
        autoComplete = new google.maps.places.Autocomplete(locationTxBx);

    // hide updated location lists
    locationTxBx.addEventListener('keyup', function () {
        $('#location-update').hide();
    });

    // map click
    map.addListener('click', function(e) {
        disableGeocoding = false;
        placeMarkerAndPanTo(e.latLng, map);
    });

    // autocomplete search
    google.maps.event.addListener(autoComplete, 'place_changed', function(e) {
        var place = autoComplete.getPlace();

        disableGeocoding = true;

        if (!place.geometry) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        _setInfoWindow(place);
        map.panTo(place.geometry.location);
        geocode(geocoder, map);
    });

    console.log('mapParams.editMode: ', mapParams.editMode);

    if (mapParams.editMode) {
        geocode(geocoder, map, true);
    }
}

/*
 * Geocode location
 * @params {Object} [geocoder] - google's geocoder obj
 * @params {Element} [resultsMap] - the map element
 * @params {Boolean} [reverseGeo] - "true" to allow reverse geocoding
 */
function geocode(geocoder, resultsMap, reverseGeo) {
    console.log('geocoding ...');

    var location = $('#location').val();
    var $locationUpdateDiv = $('#location-update');

    _clearMapMarkers();

    if (location.length) {
        setTimeout(function() {
            geocoder.geocode({'address': location}, function(results, status) {
                if (status === 'OK') {
                    if (!reverseGeo) {
                        resultsMap.setCenter(results[0].geometry.location);
                        placeMarkerAndPanTo(results[0].geometry.location, resultsMap);
                    } else {
                        console.log(results, results.length);
                        if (results.length) {
                            $locationUpdateDiv.removeClass('hidden');

                            for(var i = 0; i < results.length; i++) {
                                console.log(results[i].formatted_address);
                                $locationUpdateDiv.find('#updated-location-lists').append("<span class='tag label label-info' data-place-id="+results[i].place_id+">"+results[i].formatted_address+"</span>");
                            }
                        } else {
                            $locationUpdateDiv.addClass('hidden');
                        }
                    }
                } else {
                    _displayErrorMsg(false, '&nbsp; Geocode was not successful for the following reason: ' + status);
                }
            });
        }, 100);
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
    if (mapParams.editMode) return;

    $('#location').val(param);
}

/*
 * @description place marker on map and pan to location
 */
function placeMarkerAndPanTo(latLng, map) {
    _clearMapMarkers();
    _hideInfoWindow();

    var marker = new google.maps.Marker({
        draggable: true,
        animation: google.maps.Animation.BOUNCE,
        position: latLng,
        map: map
    });

    map.panTo(latLng);

    if (!disableGeocoding) {
        _reverseGeoCode(latLng);
    }

    mapMarkers.push(marker);

    setTimeout(function() {
        showInfoWindow(marker);
    }, 600);
}

/*
 * @description show infowindow contents
 * @params {Object} [evt]
 */
function showInfoWindow(marker) {
    infoWindow.setPosition({
        lat: marker.getPosition().lat(),
        lng: marker.getPosition().lng()
    });

    infoWindow.open(map, marker);

    $('#update-loc-link').on('click', function() {
        // can get the marker points from the evt obj
        console.log('update location link clicked ...');
    });
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
    var stringLoc = '<div><strong>' + params.formatted_address + '</strong><br>' +
        'Place ID: ' + params.place_id;

    if (mapParams.editMode) {
        stringLoc += "<div class='text-center'><hr><a href='#' id='update-loc-link'>Update my location</a></div>";
    }

    infoWindow.setContent(stringLoc);
}

/*
 * enable drawing controls
 * TODO: For later use...
 */
function displayDrawingMode() {
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
        },
        // markerOptions: {PATH_TO_IMG},
        circleOptions: {
            fillColor: '#d3d3d3',
            fillOpacity: 0.5,
            strokeWeight: 1,
            clickable: true,
            editable: true,
            zIndex: 1
        }
    });
    drawingManager.setMap(map);
}

/*
 * @params {Object} [pos] the long/lat object
 * @description update marker position
 */
function updateMap(pos) {
    if (typeof pos !== 'undefined') {
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
    }

    placeMarkerAndPanTo({lat: latitude, lng: longitude}, map);

    map.setZoom(15);
    map.setCenter({
        lat: latitude,
        lng: longitude
    });
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
 * get marker coordinates
 * @return {Object}
 */
function getMarkerCoordinates() {
    var coords;
    switch (mapMarkers.length) {
        case 0:
            coords = {
                lat: latitude,
                lng: longitude
            };
            break;
        case 1:
            coords = {
                lat: mapMarkers[0].getPosition().lat(),
                lng: mapMarkers[0].getPosition().lng()
            };
            break;
        default:
            coords = [];
            array.forEach(mapMarkers, function(marker) {
                coords.push({
                    lat: marker.getPosition().lat,
                    lng: marker.getPosition().lng
                });
            });
            break;
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
    var message = hasGeo ? msg : 'Your browser doesn\'t support Geolocation. Click on map to pinpoint where the video was recorded.';
    $('#map-alert').removeClass('hidden');
    $('#map-alert').find('.warning-msg').html(message);
    $('.loading-comment-spinner').hide();
}

/*
 * reload the map
 */
function reload() {
    google.maps.event.trigger(map, 'resize');
}

/*
 * check if map contains markers
 * @return {Boolean}
 */
function hasMarkerOnMap() {
    return map.getBounds().contains(marker.getPosition());
}

/*
 * get the map
 * @params {Number} [videoId]
 */
function get(videoId) {
    $.ajax({
        type: 'GET',
        url: '/api/videos/'+videoId+'/location'
    }).then(function(resp) {
        console.log(resp);
    }).catch(function(err) {
        // do something
    });

}

GoogleMapService.init = init;
GoogleMapService.get = get;
GoogleMapService.getMarkerCoordinates = getMarkerCoordinates;
GoogleMapService.reload = reload;
GoogleMapService.hasMarkerOnMap = hasMarkerOnMap;

module.exports = GoogleMapService;