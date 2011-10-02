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
	    response = "You are at "+lng+', '+lat;
	    bbox = getBbox({coords: { latitude: lat, longitude: lng } });
//	    console.log('_design/geo/_spatial/full?bbox='+bbox);
      path = ['_design', 'geo', '_spatial', 'full?bbox='+bbox].join('/');
	    db.query('GET',path, function(err, data) {
	      console.log(err);
	      console.log(data);
	      if(!err) {
	        _.each(data, function(el, idx) {
	          console.log(el.value.MarketName);
	        })
	      }
	      wrapitup();
	    });
	  } else {
	    response = "Sorry, but we can't find that address."
	    wrapitup();
	  }
  });
	
	// Use the say method https://www.tropo.com/docs/webapi/say.htm
//	tropo.say("I love you, "+initialText);

  // // Demonstrates how to use the base Tropo action classes.
  // var say = new Say("Please enter your 5 digit zip code.");
  // var choices = new Choices("[5 DIGITS]");
  // 
  // // Action classes can be passes as parameters to TropoWebAPI class methods.
  // // use the ask method https://www.tropo.com/docs/webapi/ask.htm
  // tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);
  // // use the on method https://www.tropo.com/docs/webapi/on.htm
  // tropo.on("continue", null, "/answer", true);

  var wrapitup = function() {
    tropo.say(response);
	  res.send(TropoJSON(tropo));
  }
  
});

app.post('/answer', function(req, res){
	// Create a new instance of the TropoWebAPI object.
	var tropo = new TropoWebAPI();
	tropo.say("Your zip code is " + req.body['result']['actions']['interpretation']);
	
	res.send(TropoJSON(tropo));
});

var port = process.env.PORT || 8000;
app.listen(port);
console.log('Server running on port '+port);


function getBbox(pos) {
  var factor = 0.016;  // About a mile...
  var bbox = [
    pos.coords.longitude - factor,
    pos.coords.latitude - factor,
    pos.coords.longitude + factor,
    pos.coords.latitude + factor
  ];

  return bbox.join(',');
};