let map;

const ViewModel = function() {
    const self = this;
    self.restaurants = ko.observableArray(locations);

    // setup empty list filter
    self.query = ko.observable("");

    // this controls which locations display in the list and on the map
    // based on user input in the sidebar
    self.filteredRestaurants = ko.computed(function() {
        const filter = self.query().toLowerCase();
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
    // initialize knockout bindings on ViewModel
    const vm = new ViewModel();
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
    const infoWindow = new google.maps.InfoWindow();

    // set up map boundary
    const bounds = new google.maps.LatLngBounds();

    const markers = [];
    let marker, i;

    // loop through restaurants and set up markers/infowindows
    for (i = 0; i < vm.restaurants().length; i++) {  
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(vm.restaurants()[i].lat, vm.restaurants()[i].long),
          map: map,
          title: vm.restaurants()[i].title,
          animation: google.maps.Animation.DROP
        });

        // add marker to markers array
        markers.push(marker);

        // add marker to location
        vm.restaurants()[i].marker = marker;

        // extend boundary of map to fit new marker
        bounds.extend(marker.position);
  
        // listen for click on marker, show infowindow
        marker.addListener('click', (function(marker, i) {
            return function() {
                // show the infowindow (which will trigger the bounce)
                showInfoWindow(map, marker);
            };
        })(marker, i));
    };

    // tell the map to fit the new boundary set by markers
    map.fitBounds(bounds);

    this.showInfoWindow = function(map, marker) {
        // clear previous infowindow
        infoWindow.setContent('');
        infoWindow.close();
        
        // query FourSquare API for extra data
        const fsClientId = 'V03AWSI2OZSAX04CKR0IYX3LIJDLWXLLKWXIPNQJNPQXPL2V';
        const fsClientSecret = 'BJASD2ONCPQMAQJS125BZ5JZHEWQ2CIUQQ5OA0IXVNT4AA3M';
        const fsAPI = 'https://api.foursquare.com/v2/venues/search';

        $.getJSON(fsAPI, {
            ll: marker.position.lat() + ',' + marker.position.lng(),
            intent: 'match',
            name: marker.title,
            limit: 1,
            client_id: fsClientId,
            client_secret: fsClientSecret,
            v: '20190115'
        })
        .done(function(data) {
            let response = data.response.venues[0];
            // add foursquare data to marker object
            marker.category = response.categories[0].shortName;
            marker.streetAddress = response.location.formattedAddress[0];
            marker.foursquareId = response.id;
            marker.foursquareLink = "https://foursquare.com/v/" + marker.foursquareId;
            // add foursquare data to infowindow
            infoWindow.setContent(
                '<p class="info info-title">' + marker.title + '</p>' +
                '<p class="info info-street">' + marker.streetAddress + '</p>' +
                '<p class="info info-category">' + marker.category + '</p>' + 
                '<p class="info info-link"><a href="' + marker.foursquareLink + '?ref=' + fsClientId + '" target="_blank">View on Foursquare</a></p>' +
                '<img class="info-attrib" src="img/powered-by-foursquare-grey-sm.png" alt="Powered by Foursquare">'
            );
        })
        .fail(function() {
            infoWindow.setContent(
                '<p class="info info-title">' + marker.title + '</p>' +
                '<p class="info info-error">Foursquare data not available!</p>'
            );
        })
        .always(function() {
            // show infowindow
            infoWindow.open(map, marker);
        });

        bounceMarker(marker);
    }

    this.bounceMarker = function(marker) {
            // MAKE IT BOUNCE (but only once)!
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(-1);
            }, 700);
    };

};