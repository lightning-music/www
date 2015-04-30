$(document).ready(function() {
  var lightning = Lightning.getInstance();

  lightning.on('pattern:position', function(pos) {
    console.log('position', pos);
  });

  $('#start-sequencer').click(function() {
    lightning.play();
  });

  $('#stop-sequencer').click(function() {
    lightning.stop();
  });
});
