$(function() {
  var server = "ws://localhost:3428",
      freesound = "/home/brian/Audio/freesound",
      ws = new WebSocket(server + "/sample/play");

  ws.onopen = function(event) {
    ws.onmessage = function(event) {
      console.log(event.data);
    };

    console.log("connected to " + server);

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

  };
});