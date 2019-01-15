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
        center: frenchQuarter,
        zoom: 18
    });

    // initialize empty infoWindow
    var infoWindow = new google.maps.InfoWindow();

    // set up map boundary
    var bounds = new google.maps.LatLngBounds();

    var marker, i;

    // loop through restaurants and set up markers/infowindows
    for (i = 0; i < vm.restaurants().length; i++) {  
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(vm.restaurants()[i].lat, vm.restaurants()[i].long),
          map: map,
          animation: google.maps.Animation.DROP
        });

        // extend boundary of map to fit new marker
        bounds.extend(marker.position);
  
        // listen for click on marker, populate then show infoWindow
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoWindow.setContent(vm.restaurants()[i].title);
                infoWindow.open(map, marker);
            }
        })(marker, i));
    };

    // tell the map to fit the new boundary set by markers
    map.fitBounds(bounds);
};