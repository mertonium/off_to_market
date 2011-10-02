/**
 * Showing with the Express framwork http://expressjs.com/
 * Express must be installed for this sample to work
 */

require('tropo-webapi');
var express = require('express');
var app = express.createServer(express.logger());

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

	var initialText = req.body.session.initialText;
	
	// Use the say method https://www.tropo.com/docs/webapi/say.htm
	tropo.say("I love you, "+initialText);

  // // Demonstrates how to use the base Tropo action classes.
  // var say = new Say("Please enter your 5 digit zip code.");
  // var choices = new Choices("[5 DIGITS]");
  // 
  // // Action classes can be passes as parameters to TropoWebAPI class methods.
  // // use the ask method https://www.tropo.com/docs/webapi/ask.htm
  // tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);
  // // use the on method https://www.tropo.com/docs/webapi/on.htm
  // tropo.on("continue", null, "/answer", true);


  res.send(TropoJSON(tropo));
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