$(function() {
  var lightning = Lightning.getInstance();
  var trigs = new Lightning.Views.SampleTriggers({
    el: '#sample-triggers'
  });

  var sequencer = Lightning.Sequencer.create({
    id: 'sequencer-input'
  });

  sequencer.on('mouse:move', function(mousePos) {
    // console.log('mouseX=' + mousePos.x + ', mouseY=' + mousePos.y);
  });

  sequencer.on('mouse:down', function(mousePos) {
    console.log('clicked (' + mousePos.x + ', ' + mousePos.y + ')');
  });
});
