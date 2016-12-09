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

var longitude = -94.636230,
    latitude = 46.392410,
    disableGeocoding = false,
    canUpdateLoc = false,
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
 * @params {Boolean} params.showCurrentLocation - show the user's current location on the map or not
 * @params {Boolean} params.editMode - map in edit mode (defaults to false)
 * @params {Boolean} params.enableDrawingMode
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

        if (mapParams.showCurrentLocation) {
            if (mapParams.editMode) {
                get(videoId)
                    .then(function(resp) {
                        // Handle the created video with location coords (ref to New videos)
                        if (typeof resp.loc !== 'undefined') {
                            $('.loading-comment-spinner').hide();
                            disableGeocoding = true;
                            canUpdateLoc = true;

                            // if is default coords, show the location lists
                            mapParams.showLocLists = (resp.loc.coordinates.indexOf(-150) > -1 && resp.loc.coordinates.indexOf(0) > -1) ? true : false;

                            if (!mapParams.showLocLists) {
                                updateMap(resp.loc.coordinates);
                            } else {
                                // enable geocoding b/c there are no coords on the map & geocode the 'clicked' suggested location list
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
        }
    });

    if (mapParams.enableDrawingMode) {
        displayDrawingMode();
    }
}

/*
 * get the users current GPS coordinates
 * @private
 */
function _getCurrentVideoCoords() {
    _getCurrentCoordinates()
        .then(function(params) {
            updateMap(params);
            mapParams.gpsEnabled = true;
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
        showCurrentLocation: params && params.showCurrentLocation || false,
        enableDrawingMode: params && params.enableDrawingMode || false,
        editMode: params && params.editMode || false,
        showLocLists: params && params.showLocLists || false,
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

    // TODO: load map and drawing lib
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
        disableGeocoding = false;
        placeMarkerAndPanTo(e.latLng, map);
    });

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
            map.setZoom(12);
        }

        _setInfoWindow(place);
        map.panTo(place.geometry.location);
        geocode(geocoder, map);
    });

    if (mapParams.editMode) geocode(geocoder, map);
}

/*
 * Geocode location
 * @params {Object} [geocoder] - google's geocoder obj
 * @params {Element} [resultsMap] - the map element
 */
function geocode(geocoder, resultsMap) {
    var location = $('#location').val();

    _clearMapMarkers();

    if (location.length) {
        setTimeout(function() {
            geocoder.geocode({'address': location}, function(results, status) {
                if (status === 'OK') {

                    if (!mapParams.showLocLists) {
                        resultsMap.setCenter(results[0].geometry.location);
                        placeMarkerAndPanTo(results[0].geometry.location, resultsMap);
                        return;
                    }

                    _showLocationLists(results);

                } else if (status === 'ZERO_RESULTS') {
                    _displayErrorMsg(true, '&nbsp; Found 0 results based on the location provided.');
                } else {
                    _displayErrorMsg(false, '&nbsp; Geocode was not successful for the following reason: ' + status);
                }
            });
        }, 100);
    }
}

/*
 * @private
 * @description show a list of suggested locations
 */
function _showLocationLists(params) {
    var obj = {};
    if (params.length) {
        $('#location-list').removeClass('hidden');

        for(var i = 0; i < params.length; i++) {
            obj.placeId = params[i].place_id;
            obj.coords = {
                lat: params[i].geometry.location.lat(),
                lng: params[i].geometry.location.lng()
            };
            $('#location-list').find('#updated-location-lists').append("<span class='tag label label-info' data-object="+JSON.stringify(obj)+">"+params[i].formatted_address+"</span>");
        }
    } else {
        $('#location-list').addClass('hidden');
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
    if (mapParams.editMode && !canUpdateLoc) return;

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
        animation: google.maps.Animation.DROP,
        position: latLng,
        map: map
    });

    if (!mapParams.gpsEnabled) {
        map.setZoom(12);
    }

    map.panTo(latLng);

    if (!disableGeocoding) {
        _reverseGeoCode(latLng);
    }

    mapMarkers.push(marker);

    marker.addListener('dragend', function() {
        canUpdateLoc = true;
        _reverseGeoCode(marker.getPosition());

    });

    setTimeout(function() {
        showInfoWindow(marker);
    }, 600);
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

    $('#update-loc-link').on('click', function() {
        canUpdateLoc = true;
        $('#location-list').hide();
        _reverseGeoCode(coords);
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
    var stringLoc = '<div><strong>' + params.formatted_address + '</strong></div>';

    if (mapParams.editMode && !canUpdateLoc) {
        stringLoc += "<div class='text-center'><hr><a href='#' id='update-loc-link'>Update my location</a></div>";
    }

    _setMarkerCooordinates({
        address: params.formatted_address,
        placeId: params.place_id
    });

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

    placeMarkerAndPanTo({lat: latitude, lng: longitude}, map);

    map.setZoom(12);
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
    var message = hasGeo ? msg : 'Your browser doesn\'t support Geolocation. Click on map to pinpoint where the video was recorded.';
    $('#map-alert').removeClass('hidden');
    $('#map-alert').find('.warning-msg').html(message);
    $('.loading-comment-spinner').hide();
}

/*
 * reload the map
 */
function reload() {
    if (typeof google !== 'undefined') {
        google.maps.event.trigger(map, 'resize');
    }
    canUpdateLoc = false;
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