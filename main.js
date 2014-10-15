$(function() {
  var lightning = Lightning.getInstance();

  var trigs = new Lightning.Views.SampleTriggers({
    el: '#sample-triggers'
  });

  var sequencer = Lightning.Sequencer.create({
    id: 'sequencer-input'
  });

  var transport = new Lightning.Views.Transport({
    el: '#transport-controls'
  });
});
