
function getMousePosWithin(boundingRect) {
  return function(event) {
    return {
      x: event.clientX - boundingRect.left,
      y: event.clientY - boundingRect.top
    };
  };
}

$(function() {
  var lightning = Lightning.getInstance(),
      canvas = document.getElementById('lightning-app'),
      ctx = canvas.getContext('2d'),
      boundingRect = canvas.getBoundingClientRect(),
      mousePos = getMousePosWithin(boundingRect);

  var trigs = new Lightning.Views.SampleTriggers({
    el: '#sample-triggers'
  });

  var sequencer = Lightning.Sequencer.create(canvas, ctx, {
    id: 'sequencer-input'
  });

  var transport = new Lightning.Views.Transport({
    el: '#transport-controls'
  });

  // TODO: have classes be able to register themselves as click listeners
  canvas.addEventListener('mousedown', function(event) {
    var pos = mousePos(event);
    console.log('clicked', pos.x, pos.y);
    sequencer.click(pos);
  });

  // main render loop
  function render() {
    sequencer.draw(ctx);
    setTimeout(render, 1);
  }

});
