'use strict';

var request = require('request');

var url = 'https://midwest-sms-polling.herokuapp.com/smsReceived'

for (var i = 0; i < Number(process.argv[2]); i++) {
  var choice = (Math.floor(Math.random() * 100) % 2) + 1;
  var curUrl = `${url}?text=bhangratest+${choice}&msisdn=${i+16876543210}`;
  request.get(curUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('OK') // Show the HTML for the Google homepage.
    } else {
      console.log(error);
    }
  });

  // Simulate someone sending multiple texts
  if (choice === 2) {
    request.get(curUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('OK') // Show the HTML for the Google homepage.
      } else {
        console.log(error);
      }
    });
  }
}
