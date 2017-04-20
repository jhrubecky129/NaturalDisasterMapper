/* Script by Jacob P. Hrubecky, David J. Waro, Peter Nielsen, 2017 */

function initialize(){
	createMap();
};

// sets map element and its properties
function createMap() {

	var mymap = L.map('mapid').setView([37.0866, -115.00], 6);

	mymap.setMaxBounds([
		[10, -200],
		[70, -20],
	]).setMinZoom(3);

	// tile layer
	L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	}).addTo(mymap);

	getData(mymap);

};

// assigns the respected geojsons to the apropriate variables
function getData(mymap) {

	var state_events = $.ajax("data/state_events.geojson", {
		dataType: "json",
		success: function(response){
			// add in later L.geoJson(response).addTo(mymap);

			// creating an array of attributes
			var attributes = processData(response);

			// call function to create proportional symbols
      createPropSymbols(response, mymap, attributes);

		}
	});

	//counties.setStyle

	var states = $.ajax("data/states_excluding_SW.geojson", {
		dataType: "json",
		success: function(response){
			L.geoJson(response).addTo(mymap);
		}
	});


	/* Currently lays over symbols and can't retrieve */
	
	// var counties = $.ajax("data/counties.geojson", {
	// 	dataType: "json",
	// 	success: function(response){
	// 		L.geoJson(response).addTo(mymap);
	// 	}
	// });

}; // close to getData

// build an attributes array for the data
function processData(data){

  // empty array to hold attributes
  var attributes = [];

  // properties of the first feature in the dataset
  var properties = data.features[0].properties;

  // push each attribute name into attributes array
  for (var attribute in properties){

    // // only take attributes with population values
    // if (attribute.indexOf("Avalanche") > -1){
    //   attributes.push(attribute);
    // } else if (attribute.indexOf("Blizzard") > -1){
    //   attributes.push(attribute);
		// } else if (attribute.indexOf("Drought") > -1){
    //   attributes.push(attribute);
		// } else if (attribute.indexOf("Excessive_Heat") > -1){
    //   attributes.push(attribute);
		// } else if (attribute.indexOf("Extreme_Cold") > -1){
    //   attributes.push(attribute);
		// } else if (attribute.indexOf("Tornado") > -1){
    //   attributes.push(attribute);
		// } else if (attribute.indexOf("Wildfire") > -1){
    //   attributes.push(attribute);
		// } else
		if (attribute.indexOf("Total_Events") > -1){
      attributes.push(attribute);
		};

  }; // close to for loop

  // return the array of attributes that meet the if statement to be pushed
  return attributes;

}; // close to processData

// add circle markers for point features to the map
function createPropSymbols(data, mymap, attributes){

  // create a Leaflet GeoJSON layer and add it to the map
  var proportionalSymbols = L.geoJson(data, {
    pointToLayer: function(feature, latlng){
      return pointToLayer(feature, latlng, attributes);
    }
  }).addTo(mymap);

  // call search function
  search(mymap, data, proportionalSymbols)

}; // close to createPropSymbols


// function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes, layer){

  // determine which attribute to visualize with proportional symbols
  var attribute = attributes[0];

  // create marker options
  var options = {
    fillColor: "#80bfff",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.7
  };

  // For each feature, determine its value for the selected attribute
  var attValue = Number(feature.properties[attribute]);

  // calculate the radius and assign it to the radius of the options marker.
  // Multiplied by 10
  options.radius = calcPropRadius((attValue * 15));

  // assign the marker with the options styling and using the latlng repsectively
  var layer = L.circleMarker(latlng, options);

	// creates a new popup object
  var popup = new Popup(feature.properties, layer, options.radius);

  // add popup to circle marker
  popup.bindToLayer();

  // event listeners to open popup on hover
  layer.on({
    mouseover: function(){
      this.openPopup();
    },
    mouseout: function(){
      this.closePopup();
    }
  });

  // return the circle marker to the L.geoJson pointToLayer option
  return layer;

}; // close to pointToLayer function


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {

  //scale factor to adjust symbol size evenly
  var scaleFactor = 10;

  //area based on attribute value and scale factor
  var area = attValue * scaleFactor;

  //radius calculated based on area
  var radius = Math.sqrt(area/Math.PI);

  // return the radius of the circle
  return radius;

}; // close to calcPropRadius


// OOM Popup constructor function
function Popup(properties, layer, radius){

  // creating the Popup object that can then be used more universally
  this.properties = properties;
  this.layer = layer;
  this.content = "<p><b>State:</b> " + this.properties.State + "</p>";

  this.bindToLayer = function(){
    this.layer.bindPopup(this.content, {
      offset: new L.Point(0,-radius),
      closeButton: false
    });
  }; // close to bindToLayer
}; // close to Popup function


// funtion to create the search control
function search (mymap, data, proportionalSymbols){

  // new variable search control
  var searchLayer = new L.Control.Search({
    position: 'topleft',  // positions the operator in the top left of the screen
    layer: proportionalSymbols,  // use proportionalSymbols as the layer to search through
    propertyName: 'State',  // search for State name
    marker: false,
    moveToLocation: function (latlng, title, mymap) {

      // set the view once searched to the circle marker's latlng and zoom
      mymap.setView(latlng, 8);

    } // close to moveToLocation
  }); // close to var searchLayer

  // add the control to the map
  mymap.addControl(searchLayer);

}; // close to search function

// function callback(response, status, jqXHRobject){
// 	console.log(response)
// }

$(document).ready(initialize);
