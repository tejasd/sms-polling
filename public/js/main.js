$(document).ready(function() {
  $.ajax({
    type: "GET",
    url: "https://midwest-sms-polling.herokuapp.com/votes",
    dataType: "json",
    success: showVotes,
    error: function(err, status) {
      console.log('Unable to call API');
    }
  });
});

var showVotes = function(data, statusCode, ignore) {
  var html = "";
  console.log(data);
  var danceEvents = Object.keys(data);
  console.log(Object.keys(data));
  for (var i = 0; i < danceEvents.length; ++i) { // Key is the name of the dance event
    console.log(danceEvents[i]);
    html += `<h2>${danceEvents[i]}</h2>`;
    html += `<table>
      <thead>
        <tr>
          <th class="teamname">Team</th>
          <th class="stretch"></th>
          <th class="votecount">Count</th>
        </tr>
      </thead>
      <tbody id="teamScores">`
      var teamNames = Object.keys(data[danceEvents[i]]);
      for (var j = 0; j < teamNames.length; ++j) {
        html += `
        <tr>
            <td class="teamname">${teamNames[j]}</td>
            <td class="stretch">
                <div class="flex">
                    <div class="bar principal"
                         style="flex:${data[danceEvents[i]][teamNames[j]]};-webkit-flex:${data[danceEvents[i]][teamNames[j]]}">
                    </div>
                </div>
            </td>
            <td class="votecount">${data[danceEvents[i]][teamNames[j]]}</td>
        </tr>`
      }
    html += `</tbody>
  </table>`

  }
  document.getElementById("votesList").innerHTML = html;
}
