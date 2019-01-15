var map;

class Location{
    constructor(title, lat, long) {
        this.title = title;
        this.lat = lat;
        this.long = long;
    }
};

var ViewModel = function() {
    var self = this;
    self.restaurants = ko.observableArray([
        new Location('Cafe Du Monde', '29.957523', '-90.061862'),
        new Location('Old Absinthe House', '29.955357', '-90.068444'),
        new Location('Bourbon House', '29.954563', '-90.069131'),
        new Location('Meauxbar', '29.962700', '-90.066160'),
        new Location('Oceana Grill', '29.956270', '-90.067619'),
        new Location('Muriel\'s Jackson Square', '29.958490', '-90.063179'),
        new Location('Brennan\'s', '29.956240', '-90.066719'),
        new Location('Sylvain', '29.957100', '-90.064240')
    ]);

    // setup empty list filter
    self.query = ko.observable("");

    // this controls which locations display in the list and on the map
    // based on user input in the sidebar
    self.filteredRestaurants = ko.computed(function() {
        var filter = self.query().toLowerCase();
        if(!filter) {
            // if filter query is empty, set all markers visible and return all restaurants
            ko.utils.arrayForEach(self.restaurants(), function(restaurant) {
                if(restaurant.marker)
                restaurant.marker.setVisible(true);
            });
            return self.restaurants();
        } else {
            // filter restaurant titles based on query
            return ko.utils.arrayFilter(self.restaurants(), function(restaurant) {
                if (restaurant.title.toLowerCase().indexOf(filter) !== -1)
                restaurant.marker.setVisible(true)
                else
                restaurant.marker.setVisible(false)
                return restaurant.title.toLowerCase().indexOf(filter) !== -1;
            });
        };
    });

    // show a list item's related marker infowindow when the list item is clicked
    self.showMarker = function(restaurant) {
        google.maps.event.trigger(restaurant.marker, "click");
    };
};

function init() {
    // set ViewModel into a variable so we can access it's properties
    const vm = new ViewModel();
    // initialize knockout bindings on ViewModel
    ko.applyBindings(vm);

    // Create a styles array to use with the map
    // Style taken from https://snazzymaps.com/style/70/unsaturated-browns
    const styles = [
        {
            "elementType": "geometry",
            "stylers": [
                {
                    "hue": "#ff4400"
                },
                {
                    "saturation": -68
                },
                {
                    "lightness": -4
                },
                {
                    "gamma": 0.72
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.icon"
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry",
            "stylers": [
                {
                    "hue": "#0077ff"
                },
                {
                    "gamma": 3.1
                }
            ]
        },
        {
            "featureType": "water",
            "stylers": [
                {
                    "hue": "#00ccff"
                },
                {
                    "gamma": 0.44
                },
                {
                    "saturation": -33
                }
            ]
        },
        {
            "featureType": "poi.park",
            "stylers": [
                {
                    "hue": "#44ff00"
                },
                {
                    "saturation": -23
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "hue": "#007fff"
                },
                {
                    "gamma": 0.77
                },
                {
                    "saturation": 65
                },
                {
                    "lightness": 99
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "gamma": 0.11
                },
                {
                    "weight": 5.6
                },
                {
                    "saturation": 99
                },
                {
                    "hue": "#0091ff"
                },
                {
                    "lightness": -86
                }
            ]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
                {
                    "lightness": -48
                },
                {
                    "hue": "#ff5e00"
                },
                {
                    "gamma": 1.2
                },
                {
                    "saturation": -23
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "saturation": -64
                },
                {
                    "hue": "#ff9100"
                },
                {
                    "lightness": 16
                },
                {
                    "gamma": 0.47
                },
                {
                    "weight": 2.7
                }
            ]
        }
    ];

    const frenchQuarter = {
        lat: 29.9584,
        lng: -90.0644
    }

    map = new google.maps.Map(document.getElementById('map'), {
        styles: styles,
        center: frenchQuarter,
        zoom: 15
    });

    // initialize empty infoWindow
    var infoWindow = new google.maps.InfoWindow();

    // set up map boundary
    var bounds = new google.maps.LatLngBounds();

    var markers = [];
    var marker, i;

    // loop through restaurants and set up markers/infowindows
    for (i = 0; i < vm.restaurants().length; i++) {  
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(vm.restaurants()[i].lat, vm.restaurants()[i].long),
          map: map,
          animation: google.maps.Animation.DROP
        });

        // add marker to markers array
        markers.push(marker);

        // add marker to location
        vm.restaurants()[i].marker = marker;

        // extend boundary of map to fit new marker
        bounds.extend(marker.position);
  
        // listen for click on marker, populate then show infoWindow
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                // loop through all markers to see if they're the one we just clicked
                for (var j = 0; j < markers.length; j++) {
                    if(i !== j) 
                    // if this isn't the marker we just clicked, make sure it isn't bouncing
                    markers[j].setAnimation(-1);
                    else
                    // if this is the marker we just clicked, show the infowindow
                    showInfoWindow(vm.restaurants()[i].title, map, marker);
                };
                toggleBounce(marker);
            }
        })(marker, i));
    };

    function showInfoWindow(title, map, marker) {
        infoWindow.setContent(title);
        infoWindow.open(map, marker);
        
    }

    function toggleBounce(marker) {
        // if this marker is already bouncing and we've clicked it, stop the bounce and hide the infowindow
        if (marker.getAnimation() === google.maps.Animation.BOUNCE) {
            marker.setAnimation(-1);
            infoWindow.close();
        } else {
            // if this marker isn't bouncing, MAKE IT BOUNCE!
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    // https://stackoverflow.com/questions/12410062/check-if-infowindow-is-opened-google-maps-v3
    function isInfoWindowOpen(infoWindow){
        var map = infoWindow.getMap();
        return (map !== null && typeof map !== "undefined");
    }

    // tell the map to fit the new boundary set by markers
    map.fitBounds(bounds);

    // listen for click on the show/hide restaurants buttons
    document.querySelector("#show-all").addEventListener('click', showRestaurants);
    document.querySelector("#hide-all").addEventListener('click', hideRestaurants);

    // show all restaurants
    function showRestaurants() {
        // clear search filter
        vm.query('');
        // loop through markers array, extend boundary of map, and show the marker
        for (var i = 0; i < markers.length; i++) {
            // reset any invisible markers (from filter function)
            markers[i].setVisible(true);
            // stop any bouncing markers
            markers[i].setAnimation(-1);
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        // close infowindow
        infoWindow.close();
        // tell the map to fit the new boundary set by markers
        map.fitBounds(bounds);
    }

    // hide all restaurants
    function hideRestaurants() {
        for (var i = 0; i < markers.length; i++) {
            // close infowindow
            infoWindow.close();
            markers[i].setMap(null);
        };
    };
};