'use strict';
var app = require('express')();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL;

var keywordsDict = require('./utilities/loadWords.js').createDictionaryOfValidKeywords();

// Setup SMS format Regex
// var smsRegex = new RegExp(/MD [A-H]/);
var phoneNoRegex = new RegExp(/\+1[0-9]{10}/);

// End point for twilio to hit after receives text messages
// from members of the audience
app.get('/smsReceived', function(req, res) {

	// Should prevent any unwanted data
	// var text = smsRegex.exec(req.query.Body);
	// text = text ? text[0] : '';
	var sender = phoneNoRegex.exec(req.query.From);
	sender = sender ? sender[0] : '';

	// Parsing response
	var choice = req.query.Body.toLowerCase();

	choice = keywordsDict[choice];
	console.log(choice);

	// Actually testing
	if (choice) { // If we reveived SMS in the correct format add to tallly
		console.log(choice);
		console.log('Valid Vote received');
		// 'insert into Votes (PhoneNo, Vote) values ('+15132231672', 'B') on duplicate key update Vote = 'B';'
		// insert it into the database
		// Get a Postgres client from the connection pool
	    // pg.connect(connectionString, function(err, client, done) {
	    //     // Handle connection errors
	    //     if(err) {
	    //       done();
	    //       console.log(err);
	    //       res.status(500).json({ success: false, data: err});
	    //     }

	    //     // SQL Query > Insert Data
	    //     client.query("INSERT INTO \"Votes\" (phoneno, vote) values($1, $2)", [sender, text[3]], function(err, result) {
	    //     	if (err) {
	    //     		console.log('error: ' + err);
	    //     		res.status(500).json({ success: false, data: err});
	    //     	} else {
	    //     		console.log('success: ' + result);
	    //     		res.status(200).json({ success: true, data: result});
	    //     		done();
	    //     	}
	    //     });
	    // });
	} else {
		console.log('Invalid Vote');
	}
});

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('SMS audience polling is being hosted at http://%s:%s', host, port);
});