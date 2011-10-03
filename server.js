/**
 * Showing with the Express framwork http://expressjs.com/
 * Express must be installed for this sample to work
 */

require('tropo-webapi');
var express = require('express'),
    app = express.createServer(express.logger()),
    geo = require('geo'),
    cradle = require('cradle'),
    _ = require('underscore');

var db = new(cradle.Connection)('http://usda.iriscouch.com', 5984).database('farmers_markets');

/**
 * Required to process the HTTP body
 * req.body has the Object while req.rawBody has the JSON string
 */
app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'ninjasfightingzombies'}));
  app.use(app.router);
});

app.post('/', function(req, res){
  var tropo = new TropoWebAPI();

  var givenAddress = req.body.session.initialText;
  console.log(givenAddress);
  var response = '', bbox, path;

  geo.geocoder(geo.google, givenAddress, false, function(formattedAddress, lat, lng) {
    if(lat && lng) {
      //response = "You are at "+lng+', '+lat;
      bbox = getBbox({coords: { latitude: lat, longitude: lng } });
//      console.log('_design/geo/_spatial/full?bbox='+bbox);
      path = ['_design', 'geo', '_spatial', 'full?bbox='+bbox].join('/');
      db.query('GET',path, function(err, markets) {
        console.log(err);
        console.log(markets);
        if(!err) {
          // Calculate how far away each market is (as the crow flies)
          _.each(markets, function(el, idx) {
            el.distance = quickDist(lat, lng, el.geometry.coordinates[1], el.geometry.coordinates[0]);
          });
          
          // Sort the markets by distance
          markets.sort(function(a, b) { return  a.distance - b.distance; });

          // Take the closest 5 markets
          markets = markets.slice(0,3);
          
          // Build our response
          _.each(markets, function(m, idx) {
            response += '#' + (idx+1) +' ' + m.value.MarketName + ' @ '+m.value.Street+' ('+m.distance.toFixed(2)+' mi). ';
            console.log(m.value.MarketName + ' is '+m.distance.toFixed(2)+' miles away.');
          });
          
        }
        wrapitup();
      });
    } else {
      response = "Sorry, but we can't find that address."
      wrapitup();
    }
  });

  var wrapitup = function() {
    response += ' Enter a number for more information.';
    var say = new Say(response);
    var choices = new Choices("[1 DIGIT]");
    
    // (choices, attempts, bargein, minConfidence, name, recognizer, required, say, timeout, voice);
    tropo.ask(choices, null, null, null, "digit", null, null, say, 60, null);
    tropo.on("continue", null, "/continue", true);

    res.send(TropoJSON(tropo));
  }

});

app.post('/continue', function(req, res){
    var tropo = new TropoWebAPI();
    var answer = req.body['result']['actions']['value'];
    tropo.say("You said " + answer);
    res.send(TropoJSON(tropo));
 });

var port = process.env.PORT || 8000;
app.listen(port);
console.log('Server running on port '+port);


function getBbox(pos) {
  var factor = 0.8;  // About 50 miles...
  var bbox = [
    pos.coords.longitude - factor,
    pos.coords.latitude - factor,
    pos.coords.longitude + factor,
    pos.coords.latitude + factor
  ];

  return bbox.join(',');
};

// http://www.movable-type.co.uk/scripts/latlong.html
var quickDist = function(lat1, lon1, lat2, lon2) {
  var R = 3963.1676; //(mi) 20902231; // radius of the earth in ft
  var d = Math.acos(Math.sin(lat1.toRad())*Math.sin(lat2.toRad()) +
                    Math.cos(lat1.toRad())*Math.cos(lat2.toRad()) *
                    Math.cos(lon2.toRad()-lon1.toRad())) * R;
  return d;
};

/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

/** Converts radians to numeric (signed) degrees */
if (typeof(Number.prototype.toDeg) === "undefined") {
  Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
  }
}