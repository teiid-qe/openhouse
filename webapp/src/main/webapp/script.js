var map;

function initMap() {
    var base = {lat: 49.2309837, lng: 16.5767087};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: base
    });
}
function showRoute(){
    var flightPath = new google.maps.Polyline({
        path: [{lat: 49.25, lng: 16.57},
            {lat: 49.26, lng: 16.57},
            {lat: 49.26, lng: 16.55},
            {lat: 49.25, lng: 16.57}
        ],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    flightPath.setMap(map);
}
function showWiki(){
    console.log("Showing Wiki.");
}
function showGeo(){
    console.log("Showing Geo.");
}
function invokeOData(url){
    console.log("Invoking OData " + url);
}
