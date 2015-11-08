'use strict';
var app = require('express')();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL;

var voteKeywords = require('./utilities/loadWords.js').voteKeywords;
var eventKeywords = require('./utilities/loadWords.js').eventKeywords;
var votes_table = require('./schema.js').votes;

var trim = require('trim');

console.log(voteKeywords);
console.log(eventKeywords);

// Setup SMS format Regex
// var smsRegex = new RegExp(/MD [A-H]/);
var phoneNoRegex = new RegExp(/1[0-9]{10}/);

// End point for nexmo to hit after it receives text messages
// from members of the audience
app.get('/smsReceived', function(req, res) {

	// No point in keeping the request open since we aren't communicating with nexmo
	res.sendStatus(200);

	// All of this logic should go into a separate "clean string method"
	req.query.text = trim(req.query.text);

	// Should prevent any unwanted data
	// var text = smsRegex.exec(req.query.Body);
	// text = text ? text[0] : '';
	var sender = phoneNoRegex.exec(req.query.msisdn);
	sender = sender ? sender[0] : '';

	// // If deciding event based on Phone number sent to
	// var pollInstance = eventKeywords[sender];

	// If deciding event based on prefix keyword (eg. JHALAK in 'JHALAK Qurbani')
	var pollInstance = req.query.text ? req.query.text.toLowerCase().split(" ")[0] : '';
	console.log(pollInstance);
	pollInstance = eventKeywords[pollInstance];

	// Parsing response
	var choice = req.query.text ? req.query.text.toLowerCase().substring(pollInstance.length + 1, req.query.text.length) : '';
	choice = voteKeywords[pollInstance] ? voteKeywords[pollInstance][choice] : '';
	choice = choice !== undefined ? choice : '';

	console.log('polling for' + pollInstance + 'with vote: ' + choice);

	// Actually testing
	if (pollInstance && (choice.length > 0)) { // If we reveived SMS in the correct format add to tallly
		console.log(choice);
		console.log('Valid Vote received');
		
		registerVote(pollInstance, choice, sender);
	    
	} else {
		console.log('Invalid Vote');
	}
});

app.post('/smsReceived', function(req, res) {
	res.sendStatus(200);
});

app.get('/seeVotes', function(req, res) {
	countVotes(res);
});

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('SMS audience polling is being hosted at http://%s:%s', host, port);
});

var registerVote = function(event_name, choice, sender) {

	var insertQuery = votes_table.insert(votes_table.event_name.value(event_name), 
		votes_table.choice.value(choice),
		votes_table.phone_no.value(sender)).toQuery();
	// var updateQuery = votes_table.update()
	console.log(insertQuery);

	pg.connect(connectionString, function(err, client, done) {
	        // Handle connection errors
	        if(err) {
	          done();
	          console.log(err);
	        } else {
	        	// SQL Query > Insert Data
		        client.query(insertQuery.text, insertQuery.values, function(err, result) {
		        	if (err) {
		        		console.log('error: ' + err);
		        	} else {
		        		console.log('success: ' + result.rows[0]);
		        		done();
		        	}
		        });
	        }   
	    });
}

var countVotes = function(response) {
	var countQuery = votes_table.select(votes_table.event_name, votes_table.choice, votes_table.count())
								.group(votes_table.event_name, votes_table.choice)
								.toQuery();

	pg.connect(connectionString, function(err, client, done) {
	        // Handle connection errors
	        if(err) {
	          done();
	          console.log(err);
	        } else {
	        	// SQL Query > Insert Data
		        client.query(countQuery.text, countQuery.values, function(err, result) {
		        	if (err) {
		        		console.log('error: ' + err);
		        		res.sendStatus(500);
		        	} else {
		        		console.log('success: ' + result.rows[0]);
		        		done();
		        		response.send(result.rows);
		        	}
		        });
	        }   
	    });

	console.log(countQuery);
}