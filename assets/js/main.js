
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
      canvas = document.getElementById('sequencer-input'),
      // ctx = canvas.getContext('2d'),
      boundingRect = canvas.getBoundingClientRect(),
      mousePos = getMousePosWithin(boundingRect),
      sampleId = null;

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

  canvas.addEventListener('mousedown', function(event) {
    var pos = mousePos(event);
    if (sampleId !== null) {
      var beat = event.target.className,
          measure = event.target.parentElement.id,
          line = Math.round((event.layerY) / 33);

      // Add the note to the proper location
      var template = _.template($('#live-sample-template').html(),
          {
            sampleMargins: (line * 33) + 'px 0 0 4px',
            sampleName: sampleId
          });
      $('#' + measure + ' .' + beat).append(template);
    } else {
      // Do nothing as the user has not clicked a sample yet
    }

    // sequencer.click(pos);
  });

  $(".files").scroller();
  $(".stage").scroller({
    horizontal: true
  });

  function moveIcons() {
    $('#sample-triggers > ul li').click(function(evt) {
      var $cursor = $('#mouse-sample');
      sampleId = $(this).attr('class');

    	$cursor.removeAttr('class')
    	    .addClass('displayBlock')
    	    .addClass(sampleId);

    	$('.stage').mousemove(function (evt) {
    	    $cursor.css({
            left:  evt.pageX + 10,
            top:   evt.pageY + 10
    	    });
    	});

      $(document).keyup(function(e) {
        if (e.keyCode == 27) { // Esc key
          sampleId = null;
          $cursor.removeAttr('class');
        }
      });
    });
  }

  console.log('setting up sample triggers');
  // wire up sample icons to their backend calls
  lightning.setupSampleTriggers(moveIcons);

});
