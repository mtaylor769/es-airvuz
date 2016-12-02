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

/*
 * Default
 * long & lat defaults to MN
 */
var longitude = -94.636230,
    latitude = 46.392410,
    locations = [],
    mapPlaceHolder = null,
    map = null,
    mapMarkers = [],
    infoWindow,
    geocoder,
    places;

/*
 * initialize the map
 * @params {Object}  params
 * @params {Element} params.dom - the div element where the map will be placed at
 * @params {Boolean} params.showCurrentLocation - show the user's current location on the map or not
 * @params {Boolean} params.enableDrawingMode
 */
function init(params) {
    var mapDom = params && params.dom || undefined,
        showCurrentLocation = params && params.showCurrentLocation || false,
        enableDrawingMode = params && params.enableDrawingMode || false;

    if (!mapDom) {
        throw new Error('Map Dom is not found');
    } else {
        mapPlaceHolder = mapDom;
    }

    GoogleMapsLoader.load(function() {
        console.log('google maps load() ===> ');
    });
    GoogleMapsLoader.onLoad(function() {
        console.log('google maps onload() ===>');

        _loadMap();

        if (showCurrentLocation) {
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

    // if (params.enableDrawingMode) {
    //     displayDrawingMode();
    // }
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
    infoWindow = new google.maps.InfoWindow({pixelOffset:new google.maps.Size(0, -40)});    // TODO: extract to own setInfoWindow()
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

    map.addListener('click', function(e) {
       placeMarkerAndPanTo(e.latLng, map);
    });

    // autocomplete search
    google.maps.event.addListener(autoComplete, 'place_changed', function(e) {
        var place = autoComplete.getPlace();
        if (place.geometry) {
            map.panTo(place.geometry.location);
            geocode(geocoder, map);
        }
    });

    geocode(geocoder, map, true);
}

/*
 * Geocode location
 * @params {Object} [geocoder] - google's geocoder obj
 * @params {Element} [resultsMap] - the map element
 * @params {Boolean} [reverseGeo] - "true" to allow reverse geocoding
 */
function geocode(geocoder, resultsMap, reverseGeo) {
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
                                $locationUpdateDiv.find('#updated-location-lists').append("<span class='tag label label-info'>"+results[i].formatted_address+"</span>");
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
 * place marker on map and pan to location
 */
function placeMarkerAndPanTo(latLng, map) {
    _clearMapMarkers();
    _hideInfoWindow();

    var marker = new google.maps.Marker({
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: latLng,
        map: map
    });

    map.panTo(latLng);

    mapMarkers.push(marker);

    for (var i = 0; i < mapMarkers.length; i++) {
        mapMarkers[i].addListener('click', showInfoWindow);
        // mapMarkers[i].addListener('dragend', showInfoWindow);
    }
}

function showInfoWindow(evt) {
    console.log('showInfoWindow() ====> ', evt);

    // Get the place details for the place
    // var marker = this;
    // places.getDetails({placeId: marker.placeResult.place_id},
    //     function(place, status) {
    //         if (status !== google.maps.places.PlacesServiceStatus.OK) {
    //             return;
    //         }
    //         infoWindow.open(map, marker);
        //     buildIWContent(place);
        // });

        infoWindow.setContent('Your current location');

        infoWindow.setPosition({
            lat: evt.latLng.lat(),
            lng: evt.latLng.lng()
        });

        infoWindow.open(map, evt.ta.target.id);
}

function _hideInfoWindow() {
    infoWindow.close();
}

function setInfoWindow(params) {

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
 * @return
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
}


/*
 * refresh the map
 */
function refresh() {
    // clear the locations
    locations.length = 0;
}

/*
 * reload the map
 */
function reload() {
    console.log('reloading map ...');
    google.maps.event.trigger(map, 'resize');
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
GoogleMapService.refresh = refresh;
GoogleMapService.reload = reload;

module.exports = GoogleMapService;