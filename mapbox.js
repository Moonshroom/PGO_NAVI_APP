window.onload = function(){
  document.getElementById("tutorial_movie").style.display="none"; //TUTORIAL REMOVE
  document.getElementById( 'map' ).innerHTML; //MAP STARTING
    mapboxgl.accessToken = 'pk.eyJ1IjoibW9vbnNocm9vbSIsImEiOiJjam5jdmdqaWQwNXNvM29waW53aDU5bGJhIn0.VxYvFwoXWhXgjv57--aiQg' 
    var map = new mapboxgl.Map({
      container: 'map',
      style:'mapbox://styles/moonshroom/cjv8o8xfo1itm1foydjulk6yx',
      zoom: 11,
      center: [16.929, 52.403]
    });

document.getElementById("directions").style.display="none"; //DIRECTIONS REMOVE

var locate = new mapboxgl.GeolocateControl({
  positionOptions: {
  enableHighAccuracy: true
  },
  trackUserLocation: true
  });
map.addControl(locate, 'bottom-right'); //Locate the user

var nav = new mapboxgl.NavigationControl();//MAP NAVIGATION
  map.addControl(nav, 'bottom-right');

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
    });
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));//GEOCODER



//HEATMAP
document.getElementById('switch').onclick = function toggleCheck() {
    if(document.getElementById("switch").checked === true){
        map.setLayoutProperty('pokestopy-2180-40kynq', 'visibility', 'visible')&& 
        map.setLayoutProperty('pokestops', 'visibility', 'none')&&
        map.setLayoutProperty('gym', 'visibility', 'none');
    } else if (document.getElementById("switch").checked === false){
        map.setLayoutProperty('pokestopy-2180-40kynq', 'visibility', 'none')&& 
        map.setLayoutProperty('pokestops', 'visibility', 'visible')&&
        map.setLayoutProperty('gym', 'visibility', 'visible');
    }
  }
//DELETING USELESS TOOLS
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      line_string: true,
      trash: true
    },
// Set the line style for the user-input coordinates    
    styles: [
      {
        "id": "gl-draw-line",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"],
          ["!=", "mode", "static"]
        ],
        "layout": {
          "line-cap": "round",
          "line-join": "round"
        },
        "paint": {
          "line-color": "#ff0000",
          "line-dasharray": [0.2, 2],
          "line-width": 5,
          "line-opacity": 0.9
        }
      },
      // Style the vertex point halos
      {
        "id": "gl-draw-polygon-and-line-vertex-halo-active",
        "type": "circle",
        "filter": ["all", ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"]
        ],
        "paint": {
          "circle-radius": 5,
          "circle-color": "#ffffff"
        }
      },
      // Style the vertex points
      {
        "id": "gl-draw-polygon-and-line-vertex-active",
        "type": "circle",
        "filter": ["all", ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"]
        ],
        "paint": {
          "circle-radius": 4,
          "circle-color": "#ff0000",
        }
      },
    ]
  });
  
  
map.addControl(draw,'bottom-right'); // Add the draw tool to the map

//Map Matching API request
function updateRoute() {
    
    var profile = "walking"; // Set the profile
    var data = draw.getAll();// Get the coordinates that were drawn on the map
    var lastFeature = data.features.length - 1;
    var coords = data.features[lastFeature].geometry.coordinates;  
    var newCoords = coords.join(';') // Format the coordinates
    
    getMatch(newCoords,  profile);
  }

// Make a Map Matching request
function getMatch(coordinates,  profile) {
    // Create the query
    var query = 'https://api.mapbox.com/matching/v5/mapbox/' + profile + '/' + coordinates + '?geometries=geojson&radiuses=' + '&steps=true&access_token=' + mapboxgl.accessToken;

    $.ajax({
      method: 'GET',
      url: query
    }).done(function(data) {
      var coords = data.matchings[0].geometry; // Get the coordinates from the response
      addRoute(coords); // Draw the route on the map
      getInstructions(data.matchings[0]);
    });
  }

map.on('draw.create', updateRoute);
map.on('draw.update', updateRoute);

//Map Matching route as a new layer on the map
function addRoute(coords) {
    // If a route is already loaded, remove it
    if (map.getSource('route')) {
      map.removeLayer('route')
      map.removeSource('route')
    } else { // Add a new layer to the map
      map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
          "type": "geojson",
          "data": {
            "type": "Feature",
            "properties": {},
            "geometry": coords
          }
        },
        "layout": {
          "line-join": "round",
          "line-cap": "round"
        },
        "paint": {
          "line-color": "#ed1307",
          "line-width": 8,
          "line-opacity": 0.9
        }
      });
    };
  }

function getInstructions(data) {
    //add the instructions
    var directions = document.getElementById('directions');
  
    var legs = data.legs;
    var tripDirections = [];
    // Output the instructions for each step of each leg in the response object
    for (var i = 0; i < legs.length; i++) {
      var steps = legs[i].steps;
      for (var j = 0; j < steps.length; j++) {
        tripDirections.push('<br><li>' + steps[j].maneuver.instruction) + '</li>';
      }
    }
    directions.innerHTML = '<h2>Trip duration: ' + Math.floor(data.duration / 60) + ' min.</h2>' + '<button type="button" id="gm" onclick="abc()">Show on GoogleMaps</button>' + '<p></p>' +  tripDirections
    ;
    document.getElementById("directions").style.display="block";

  // If the user clicks the delete draw button, remove the layer if it exists
function removeRoute() {
    if (map.getSource('route')) {
      map.removeLayer('route');
      map.removeSource('route');
      document.getElementById("directions").style.display="none";
    } else {
      return;
    }
  }
  map.on('draw.create', updateRoute);
  map.on('draw.update', updateRoute);
  map.on('draw.delete', removeRoute); 
  }
}

function hideshow() 
{
  var x = document.getElementById("remove");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
};

// tutorial movie show 
function hideshow_tutorial() 
{ 
  tutorial_movie.innerHTML = '<iframe width="94%" height="100%" src="https://www.youtube.com/embed/PygxkWJ3TNQ?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' + '<button class="movie" type="button" onclick="closingtuto()">X</button>';
  document.getElementById('tutorial_movie').style.display = "block";
};
//tutorial movie close
function closingtuto ()
{
  document.getElementById('tutorial_movie').style.display = "none";
};

//starting introjs
function starttutorial() 
{
  document.getElementById("remove").style.display = "none";
  introJs().start();
};

//error detecting
window.onerror = function(message, url, line) {
  alert('Sorry, but we need to reload this page' + ', ' + 'More accurate information about ERROR :'   + message + ', ' + url + ', ' + line);
  window.location.reload(true);
};

//GoogleMaps opening 
function abc() {window.open("https://www.google.com/maps/@52.3836996,16.8772574,14z")} ;

//GOOGLE MAPS 
/*function initialize() {
  var map = new google.maps.Map(
    document.getElementById("map"), {
      center: new google.maps.LatLng(16.929, 52.403),
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
  map.data.addGeoJson(jsonData);
  map.data.setStyle({
    strokeColor: "blue"
  })

}
google.maps.event.addDomListener(window, "load", initialize);
var jsonData = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "stroke": "#555555",
      "stroke-width": 2,
      "stroke-opacity": 1
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [coords]
    }
  }]
};*/

function hideshow() 
{
  var x = document.getElementById("remove");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
};
// tutorial movie show 
function hideshow_tutorial() 
{ 
  tutorial_movie.innerHTML = '<iframe width="94%" height="100%" src="https://www.youtube.com/embed/PygxkWJ3TNQ?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' + '<button class="movie" type="button" onclick="closingtuto()">X</button>';
  document.getElementById('tutorial_movie').style.display = "block";
};
//tutorial movie close
function closingtuto ()
{
  document.getElementById('tutorial_movie').style.display = "none";
};
//starting introjs
function starttutorial() 
{
  document.getElementById("remove").style.display = "none";
  introJs().start();
};

//error detecting
window.onerror = function(message, url, line) {
  alert('Sorry, but we need to reload this page' + ', ' + 'More accurate information about ERROR :' + message + ', ' + url + ', ' + line);
  window.location.reload(true);
};
