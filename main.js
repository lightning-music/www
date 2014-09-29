$(function() {
  var lightning = Lightning.getInstance();
  var trigs = new Lightning.Views.SampleTriggers({
    el: '#sample-triggers'
  });

  function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  var canvas = document.getElementById('sequencer-input');
  var ctx = canvas.getContext('2d');
  canvas.addEventListener('mousemove', function(event) {
    var mousePos = getMousePos(canvas, event);
    console.log('mouseX=' + mousePos.x + ', mouseY=' + mousePos.y);
  });
});
