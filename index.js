'use strict';
var app = require('express')();

app.get('/smsReceived', function(req, res) {
	console.log(req);
})

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('SMS audience polling is being hosted at http://%s:%s', host, port);
});