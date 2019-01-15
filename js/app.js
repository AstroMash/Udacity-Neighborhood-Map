var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 29.9584, lng: -90.0644},
        zoom: 13
    });
}