$(function() {
  var lightning = Lightning.getInstance();
  var trigs = new Lightning.Views.SampleTriggers({ el: '#sample-triggers' });
  
  // lightning.listSamples(function(err, samples) {
  //   if (err) {
  //     throw err;
  //   } else {
  //     var samps;
  //     samps = JSON.parse(samples);
  //     var trigs = new Lightning.Views.SampleTriggers({
  //       collection: samps
  //     });
  //     // trigs.render();
  //   }
  // });

  // $("#sample1").click(function(event) {
  //   ws.send(JSON.stringify({
  //     sample: freesound + "/21653__madjad__indonesian-thum-note-2.wav",
  //     number: 60,
  //     velocity: 96
  //   }));
  // });

  // $("#sample2").click(function(event) {
  //   ws.send(JSON.stringify({
  //     sample: freesound + "/48223__slothrop__trumpetc2.wav",
  //     number: 48,
  //     velocity: 96
  //   }));
  // });

  // $("#sample3").click(function(event) {
  //   ws.send(JSON.stringify({
  //     sample: freesound + "/48223__slothrop__trumpetc2.wav",
  //     number: 52,
  //     velocity: 96
  //   }));
  // });

  // $("#sample4").click(function(event) {
  //   ws.send(JSON.stringify({
  //     sample: freesound + "/48223__slothrop__trumpetc2.wav",
  //     number: 55,
  //     velocity: 96
  //   }));
  // });

  // $("#sample5").click(function(event) {
  //   ws.send(JSON.stringify({
  //     sample: freesound + "/25838__neutri__vargan-ptd.wav",
  //     number: 48,
  //     velocity: 96
  //   }));
  // });

  // $("#sample6").click(function(event) {
  //   ws.send(JSON.stringify({
  //     sample: freesound + "/25838__neutri__vargan-ptd.wav",
  //     number: 60,
  //     velocity: 96
  //   }));
  // });

  // $("#sample7").click(function(event) {
  //   ws.send(JSON.stringify({
  //     sample: freesound + "/25838__neutri__vargan-ptd.wav",
  //     number: 72,
  //     velocity: 96
  //   }));
  // });

  // $("#sample8").click(function(event) {
  //   ws.send(JSON.stringify({
  //     sample: freesound + "/25838__neutri__vargan-ptd.wav",
  //     number: 84,
  //     velocity: 96
  //   }));
  // });

});
