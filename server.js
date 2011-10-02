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
  app.use(app.router);
});

app.post('/', function(req, res){
	// Create a new instance of the TropoWebAPI object.
	var tropo = new TropoWebAPI();
	var initialText = session.session.initialText;
	tropo.say('I love you Mr. '+initialText);
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