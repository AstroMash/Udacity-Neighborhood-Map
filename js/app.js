var map;
var restaurantsVisible = true;

var ViewModel = function() {
    var self = this;
    self.restaurants = ko.observableArray(locations);

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

    const frenchQuarter = {
        lat: 29.9584,
        lng: -90.0644
    }

    map = new google.maps.Map(document.getElementById('map'), {
        styles: unsatBrown,
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
        marker.addListener('click', (function(marker, i) {
            return function() {
                // show the infowindow (which will trigger the bounce)
                showInfoWindow(vm.restaurants()[i].title, map, marker);
            };
        })(marker, i));
    };

    function showInfoWindow(title, map, marker) {
        bounceMarker(marker);
        infoWindow.setContent(title);
        infoWindow.open(map, marker);
        
    }

    function bounceMarker(marker) {
            // MAKE IT BOUNCE (but only once)!
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(-1);
            }, 700);
        
    }

    // tell the map to fit the new boundary set by markers
    map.fitBounds(bounds);

    // listen for click on the show/hide restaurants buttons
    document.querySelector("#toggle-all").addEventListener('click', toggleRestaurants);

    // toggle restaurant visibility
    function toggleRestaurants() {
        if(restaurantsVisible === false) {
            // toggle visibility variable
            restaurantsVisible = true;
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
        } else {
            // toggle visibility variable
            restaurantsVisible = false;
            for (var i = 0; i < markers.length; i++) {
                // close infowindow
                infoWindow.close();
                markers[i].setMap(null);
            };
        }
    }

};