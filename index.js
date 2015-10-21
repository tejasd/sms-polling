'use strict';
var app = require('express')();
var bodyParser = require('body-parser');

// Third party middleware
app.use(bodyParser.json());

app.post('/smsReceived', function(req, res) {
	console.log(req.body);
})

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('SMS audience polling is being hosted at http://%s:%s', host, port);
});