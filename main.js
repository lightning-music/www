

$(function() {
  var wsServer = "ws://localhost:3428",
      httpServer = "http://localhost:3428",
      freesound = "/home/brian/Audio/freesound",
      ws = new WebSocket(wsServer + "/sample/play");

  // get the list of samples and add buttons
  $.ajax({
    type: "GET",
    url: httpServer + "/samples",
    error: function() {
      console.log("error getting samples");
    },
    success: function(samples) {
      console.log(JSON.stringify(samples));
    }
  });

  ws.onopen = function(event) {
    ws.onmessage = function(event) {
      console.log(event.data);
    };

    console.log("connected to " + wsServer);

    $("#sample1").click(function(event) {
      ws.send(JSON.stringify({
        sample: freesound + "/21653__madjad__indonesian-thum-note-2.wav",
        number: 60,
        velocity: 96
      }));
    });

    $("#sample2").click(function(event) {
      ws.send(JSON.stringify({
        sample: freesound + "/48223__slothrop__trumpetc2.wav",
        number: 48,
        velocity: 96
      }));
    });

    $("#sample3").click(function(event) {
      ws.send(JSON.stringify({
        sample: freesound + "/48223__slothrop__trumpetc2.wav",
        number: 52,
        velocity: 96
      }));
    });

    $("#sample4").click(function(event) {
      ws.send(JSON.stringify({
        sample: freesound + "/48223__slothrop__trumpetc2.wav",
        number: 55,
        velocity: 96
      }));
    });

    $("#sample5").click(function(event) {
      ws.send(JSON.stringify({
        sample: freesound + "/25838__neutri__vargan-ptd.wav",
        number: 48,
        velocity: 96
      }));
    });

    $("#sample6").click(function(event) {
      ws.send(JSON.stringify({
        sample: freesound + "/25838__neutri__vargan-ptd.wav",
        number: 60,
        velocity: 96
      }));
    });

    $("#sample7").click(function(event) {
      ws.send(JSON.stringify({
        sample: freesound + "/25838__neutri__vargan-ptd.wav",
        number: 72,
        velocity: 96
      }));
    });

    $("#sample8").click(function(event) {
      ws.send(JSON.stringify({
        sample: freesound + "/25838__neutri__vargan-ptd.wav",
        number: 84,
        velocity: 96
      }));
    });

  };
});