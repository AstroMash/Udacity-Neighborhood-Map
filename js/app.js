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
    self.restaurants = [
        new Location('Meauxbar', '29.962700', '-90.066160'),
        new Location('Meauxbar', '29.962700', '-90.066160'),
        new Location('Oceana Grill', '29.956270', '-90.067619'),
        new Location('Muriel\'s Jackson Square', '29.958490', '-90.063179'),
        new Location('Brennan\'s', '29.956240', '-90.066719'),
        new Location('Sylvain', '29.957100', '-90.064240')
    ];
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
        zoom: 15
    });

    // initialize empty infoWindow
    var infoWindow = new google.maps.InfoWindow();

    var marker, i;

    // loop through restaurants and set up markers/infowindows
    for (i = 0; i < vm.restaurants.length; i++) {  
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(vm.restaurants[i].lat, vm.restaurants[i].long),
          map: map
        });
  
        // listen for click on marker, show infowindow
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoWindow.setContent(vm.restaurants[i].title);
                infoWindow.open(map, marker);
            }
        })(marker, i));
    };
};