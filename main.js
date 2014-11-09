
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

  // var sequencer = Lightning.Sequencer.create(canvas, ctx, {
  //   id: 'sequencer-input'
  // });

  // var transport = new Lightning.Views.Transport({
  //   el: '#transport-controls'
  // });

  // TODO: have classes be able to register themselves as click listeners
  // canvas.addEventListener('mousedown', function(event) {
  //   var pos = mousePos(event);
  //   console.log('clicked', pos.x, pos.y);
  //   sequencer.click(pos);
  // });

  // main render loop
  // function render() {
  //   sequencer.draw(ctx);
  //   setTimeout(render, 1);
  // }

  // JG Added
  $(".files").scroller();
  $(".stage").scroller({
	horizontal: true
  });

  function moveIcons() {
    $('#sample-triggers > ul li').click(function(evt) {
	  var sampleId = $(this).attr('class'),
	      $cursor = $('#mouse-sample');

	  $cursor.removeAttr('class')
	    .addClass('displayBlock')
	    .addClass(sampleId);

	  $('.stage').mousemove(function (evt) {
        $cursor.css({
    	  left:  evt.pageX,
    	  top:   evt.pageY
        });
	  });
    });
  }

  console.log('setting up sample triggers');
  // wire up sample icons to their backend calls
  lightning.setupSampleTriggers(moveIcons);

});
