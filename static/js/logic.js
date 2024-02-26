// We create the tile layer that will be the background of our map.
let basemap = L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
);


// We create the map object.
let map = L.map("map", {
  center: [
    40.7, -94.5
  ],
  zoom: 3
});

// Then we add our 'basemap' tile layer to the map.
basemap.addTo(map);

// Here we make a call that retrieves our earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(depth) {
    switch (true) {
      case depth > 90:
        return "#FB1401";
      case depth > 70:
        return "#FB3E01";
      case depth > 50:
        return "#FB7301";
      case depth > 30:
        return "#FED924";
      case depth > 10:
        return "#04ED0B";
      default:
        return "#038006";
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // This function returns the style data for each of the earthquakes we plot on
  // the map. We pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      // USE STYLE ATTRIBUTES (e.g., opacity, fillOpacity, stroke, weight) 
      weight: 1,
      opacity: 0.8, // Fixed typo here
      fillOpacity: 0.35,
      fillColor: getColor(feature.properties.mag), // Pass magnitude to getColor
      color: getColor,
      radius: getRadius(feature.properties.mag) // Pass magnitude to getRadius
    };
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {

    // We turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },

    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,

    // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3> Where: " + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<br><h2> Magnitude: " + feature.properties.mag + "</h2>"
      );
    }
  }).addTo(map);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });
  
  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
  
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#038006", "#04ED0B", "#FED924", "#FB7301", "#FB3E01", "#FB1401"];
  
    // Loop through depth ranges to generate a label with a colored square for each range.
    for (let i = 0; i < depths.length; i++) {
      let depthLabel = depths[i];
      let nextDepth = depths[i + 1];
  
      let depthRange = depthLabel + (nextDepth ? "&ndash;" + nextDepth : "+") + " km"; // Display depth ranges in kilometers
  
      // Create a colored square with the corresponding color
      let colorSquare = '<i style="background:' + getColor(depthLabel) + '"></i>';
  
      div.innerHTML += colorSquare + ' ' + depthRange + '<br>';
    }
    return div;
  };

  // Finally, we add our legend to the map.
  legend.addTo(map);
});
