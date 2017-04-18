/* Stylesheet by Jacob P. Hrubecky, 2017 */
var mymap = L.map('mapid').setView([37.0866, -111.330122], 7);

//tile layer
L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(mymap);

var counties = $.ajax("data/counties.geojson", {
	dataType: "json",
	success: function(response){
		L.geoJson(response).addTo(mymap);
	}
});

counties.setStyle

var states = $.ajax("data/states.geojson", {
	dataType: "json",
	success: function(response){
		L.geoJson(response).addTo(mymap);
	}
});

function callback(response, status, jqXHRobject){
	console.log(response)
}

function initialize(){
    
}

$(document).ready(initialize);
