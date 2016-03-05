'use strict';
var express = require('express');
var app = express();
var corser = require("corser");

var pg = require('pg');
var connectionString = process.env.DATABASE_URL;
var nexmo = require('easynexmo');
nexmo.initialize(process.env.NEXMO_KEY, process.env.NEXMO_SECRET, false);

var voteKeywords = require('./utilities/loadWords').voteKeywords;
var eventKeywords = require('./utilities/loadWords').eventKeywords;
var originalKeywords = require('./utilities/loadWords').originalKeywords;
var votes_table = require('./schema.js').votes;

var trim = require('trim');

var counter = 400;
app.use(corser.create());
app.use('/static', express.static(__dirname + '/public'));

console.log(voteKeywords);
console.log(eventKeywords);

// Setup SMS format Regex
var phoneNoRegex = new RegExp(/1[0-9]{10}/);

// End point for nexmo to hit after it receives text messages
// from members of the audience
app.get('/smsReceived', function(req, res) {

	// No point in keeping the request open since we aren't communicating with nexmo
	res.sendStatus(200);

	console.log('Received Text: ' + req.query.text);
	console.log('From msisdn: ' + req.query.msisdn);

	// All of this logic should go into a separate "clean string method"
	req.query.text = req.query.text ? trim(req.query.text) : '';

	// Should prevent any unwanted data
	// var text = smsRegex.exec(req.query.Body);
	// text = text ? text[0] : '';
	var sender = phoneNoRegex.exec(req.query.msisdn);
	sender = sender ? sender[0] : '';

	// If deciding event based on prefix keyword (eg. JHALAK in 'JHALAK Qurbani')
	var pollInstance = req.query.text ? req.query.text.toLowerCase().split(" ")[0] : '';
	pollInstance = eventKeywords[pollInstance];

	// Parsing response
	var choice = req.query.text ? req.query.text.toLowerCase().split(" ")[1] : ''
	choice = voteKeywords[pollInstance] ? voteKeywords[pollInstance][choice] : '';
	choice = choice !== undefined ? choice : '';


	// Actually testing
	if (pollInstance && (choice.length > 0)) { // If we reveived SMS in the correct format add to tallly
		console.log('Valid vote received for: ' + pollInstance + ' with vote: ' + choice + ' from sender: ' + sender);
		registerVote(pollInstance, choice, sender);

	} else {
		console.log('Invalid Vote from sender: ' + sender);
		if (sender.length === 11) {
			if (counter > 0) {
				nexmo.sendTextMessage('12092603494',sender,`Hey ${sender}! We couldn't understand your choice! Please check your message and send again :)`,{},function() {
				});
			}

		}
	}
});

app.post('/smsReceived', function(req, res) {
	res.sendStatus(200);
});

app.get('/votes', function(req, res) {
	countVotes(function(result, err) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.send(transformVoteCount(result));
		}
	});
});

app.get('/validChoices', function(req, res) {
	res.send(originalKeywords);
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

	pg.connect(connectionString, function(err, client, done) {
	        // Handle connection errors
	        if(err) {
	          done();
	          console.log(err);
	        } else {
	        	// SQL Query > Insert Data
		        client.query(insertQuery.text, insertQuery.values, function(err, result) {
		        	if (err) {
		        		console.error(sender + ' tried double voting: ', err);
								done();
		        	} else {
		        		console.log('success: ' + result.rows[0]);
		        		done();
		        	}
		        });
	        }
	    });
}

var countVotes = function(callback) {
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
		        		callback(null, err);
								done();
		        	} else {
		        		console.log('success: ' + result.rows[0]);
		        		done();
		        		callback(result.rows, null);
		        	}
		        });
	        }
	    });
}

var transformVoteCount = function(data) {
	var result = {};
	for (var i = 0; i < data.length; ++i) {
		if (result[data[i].event_name]) {
			result[data[i].event_name][data[i].choice] = data[i].votes_count;
		} else {
			result[data[i].event_name] = {};
			result[data[i].event_name][data[i].choice] = data[i].votes_count;
		}
	}
	return result;
}
