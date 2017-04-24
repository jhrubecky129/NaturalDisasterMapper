/* Script by Jacob P. Hrubecky, David J. Waro, Peter Nielsen, 2017 */

function initialize(){
	createMap();
};

// Title
$("#title").append("<b>Natural Disaster Mapper</b>");


// sets map element and its properties
function createMap() {

	var mymap = L.map('mapid').setView([37.0866, -115.00], 5);

	mymap.setMaxBounds([
		[10, -200],
		[75, -20],
	]).setMinZoom(3);

	// tile layer
	L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	}).addTo(mymap);

	//add navigation bar to the map
	L.control.navbar().addTo(mymap);

	getData(mymap);

};

// assigns the respected geojsons to the apropriate variables
function getData(mymap) {

	var county_events = $.ajax("data/county_events.geojson", {
		dataType: "json",
		success: function(response){
			// add in later L.geoJson(response).addTo(mymap);

			// creating an array of attributes
			var attributes = processData(response);

			// call function to create proportional symbols
      createPropSymbols(response, mymap, attributes);
			createLegend(mymap, attributes);
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
		if (attribute.indexOf("Total_Events_2000") > -1){
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

	proportionalSymbols.bringToFront();

  // call search function
  search(mymap, data, proportionalSymbols)

	// call to create the dropdown menu
	dropdown(mymap, data, attributes, proportionalSymbols)

}; // close to createPropSymbols


// function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes, layer){

  // determine which attribute to visualize with proportional symbols
  var attribute = attributes[0];

  // create marker options
  var options = {
    fillColor: "#FFF",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.7
  };

  // For each feature, determine its value for the selected attribute
  var attValue = Number(feature.properties[attribute]);

  // calculate the radius and assign it to the radius of the options marker.
  // Multiplied by 10
  options.radius = calcPropRadius((attValue * 20));

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
  this.content = "<p><b>County:</b> " + this.properties.County + "</p>";

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
    position: 'topright',  // positions the operator in the top left of the screen
    layer: proportionalSymbols,  // use proportionalSymbols as the layer to search through
    propertyName: 'County',  // search for State name
    marker: false,
    moveToLocation: function (latlng, title, mymap) {

      // set the view once searched to the circle marker's latlng and zoom
      mymap.setView(latlng, 8);

    } // close to moveToLocation
  }); // close to var searchLayer

  // add the control to the map
  mymap.addControl(searchLayer);

}; // close to search function





function dropdown(mymap, data, proportioinalSymbols) {

	var legend = new L.control({
		//position: 'topright',
		//layer: proportioinalSymbols,
	});

	legend.onAdd = function (mymap) {
		var div = L.DomUtil.create('div', 'dropdown');
		div.innerHTML = '<select><option>1</option><option>2</option><option>3</option></select>';
		div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
		return div;
	};

	legend.addTo(mymap);

}




// function to create the Proportional Symbols map legend
function createLegend(mymap, attributes){

  // legend control in the bottom right of the map
  var LegendControl = L.Control.extend({
    options: {
      position: 'bottomleft'
    },


    onAdd: function (mymap) {

      // create the control container with a particular class name
      var legendContainer = L.DomUtil.create('div', 'legend-control-container');

      $(legendContainer).append('<div id="temporal-legend" >');

      // start attribute legend svg string
      var svg = '<svg id="attribute-legend" width="140px" height="80px">';

      //object to base loop on
      var circles = {
        max: 30,
        mean: 50,
        min: 70
      };

      // loop to add each circle and text to svg string
      for (var circle in circles){

        //c ircle string
        svg += '<circle class="legend-circle" id="' + circle + '" fill="#fff" fill-opacity="0.8" stroke="#000000" cx="50"/>';

        // text string
        svg += '<text id="' + circle + '-text" x="90" y="' + circles[circle] + '"></text>';
      };

      // close svg string
      svg += "</svg>";

      // add attribute legend svg to container
      $(legendContainer).append(svg);

      //t urn off any mouse event listeners on the legend
      $(legendContainer).on('mousedown dblclick', function(e){
        L.DomEvent.stopPropagation(e);
      });

      return legendContainer;

    } // close to onAdd
  }); // close to var LegendControl

  // add the legendControl to the map and update it
  mymap.addControl(new LegendControl());
  updateLegend(mymap, attributes[0]);

}; // close to createLegend function



// Calculate the max, mean, and min values for a given attribute
function getCircleValues(mymap, attribute){

  // start with min at highest possible and max at lowest possible number
  var min = Infinity,
      max = -Infinity;

  // for each layer
  mymap.eachLayer(function(layer){
    //get the attribute value
    if (layer.feature){
      var attributeValue = Number(layer.feature.properties[attribute]);

      //test for min
      if (attributeValue < min){
        min = attributeValue;
      };

      //test for max
      if (attributeValue > max){
        max = attributeValue;
      };
    };
  });

  //set mean
  var mean = (max + min) / 2;

  //return values as an object
  return {
    max: max,
    mean: mean,
    min: min
  };
}; // close to getCircleValues




// updates the temporal legend with new content
function updateLegend(mymap, attribute){

  var year = attribute.split("_")[2]; // split on the 3rd _

	if (year[0] !== "2") {
		year = attribute.split("_")[1];
	}

  var eventType = attribute.split("_")[0] + " "; // split on the 4th _

  // content to be added to the legend
  var legendContent = "<b><br>Number of " + eventType + "Events</br> in " + year + ".</b>";

  // add in the text to the legend div
  $('#temporal-legend').html(legendContent);

  // get the max, mean, and min values as an object
  var circleValues = getCircleValues(mymap, attribute);

  // searches through circleValues array for instances where key shows up
  for (var key in circleValues){

       //get the radius
       var radius = calcPropRadius((circleValues[key])* 20);

       // assign the cy and r attributes
       $('#' + key).attr({
           cy: 75 - radius,
           r: radius
       });

       // add legend text for the circles
       $('#' + key + '-text').text(Math.round((circleValues[key]) * 20));
   };
};

// function callback(response, status, jqXHRobject){
// 	console.log(response)
// }

$(document).ready(initialize);
