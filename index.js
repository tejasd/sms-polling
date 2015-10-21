'use strict';
var app = require('express')();

// Setup SMS format Regex
var smsRegex = new RegExp(/MD [A-H]/);
var phoneNoRegex = new RegExp(/\+1[0-9]{10}/);

// End point for twilio to hit after receives text messages
// from members of the audience
app.get('/smsReceived', function(req, res) {

	// Should prevent any unwanted data
	var text = smsRegex.exec(req.query.Body);
	text = text ? text[0] : '';
	var sender = phoneNoRegex.exec(req.query.From);
	sender = sender ? sender[0] : '';

	// Actually testing
	if (text.length > 0) { // If we reveived SMS in the correct format add to tallly
		console.log(text[3]);
		console.log('Valid Vote received');
		// 'insert into Votes (PhoneNo, Vote) values ('+15132231672', 'B') on duplicate key update Vote = 'B';'
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