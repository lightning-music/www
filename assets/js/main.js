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
        sampleArr = new Array(), timeSig = '3_3', y = 0,
        boundingRect = canvas.getBoundingClientRect(),
        mousePos = getMousePosWithin(boundingRect),
        sampleId = null, cursor =$('[data-cursor=true]');

    var trigs = new Lightning.Views.SampleTriggers({
        el: '#sample-triggers'
    });

    // TODO: have classes be able to register themselves as click listeners

    canvas.addEventListener('mousedown', function(event) {
        var pos = mousePos(event);
        if (event.srcElement.className == 'addMeasure') {
            var measureId = ($('#measure-count').html())*1,
                seqWidth = $('#sequencer-input').width(),
                staffWidth = $('.staff-lines').width(),
                mWidth = $('#measure001').width(),
                measureTpl = _.template($('#measure-template').html(),
                {
                    measureId: measureId
                });

            // Add the sample to the DOM
            $('#extraMeasures').append(measureTpl);
            // Update the data-measures count
            $('#measure-count').html(measureId+1);
            $('#sequencer-input').css('width', (seqWidth + mWidth) + 'px');
            $('.staff-lines').width((staffWidth + mWidth) + 'px');
            $(".stage").scroller("reset");

        } if (sampleId !== null) {
            // User didn't click on addMeasure, the only other thing they could
            // have clicked on is it's parent element... #sequencer-input
            var beatId = event.target.className,
                measureId = event.target.parentElement.id,
                lNum = Math.round(event.layerY / 32),
                line = ((lNum > 0 && lNum < 3) || lNum > 7) ? 'll-' : 'sl-',
                beat = beatId.charAt(beatId.length - 1),
                measure = measureId.charAt(measureId.length - 1);

            if ((event.layerY / 32) > 0.5) {
                var sampleTpl = _.template($('#live-sample-template').html(),
                {
                    // Margins are offset to account for the tile image size,
                    // and for centering within the measure.
                    sampleMargins: (event.layerY - 20) + 'px 0 0 4px',
                    sampleName: sampleId,
                    sampleRef: sampleId + '-' + y
                });

                // Add the sample to the DOM
                $('#' + measureId + ' .' + beatId).append(sampleTpl);

                if (line == 'll-' && lNum < 8) {
                    line += lNum;
                } else if (line == 'll-' && lNum > 7) {
                    line += (lNum - 5);
                } else if (line == 'sl-' && lNum < 8) {
                    line += (lNum - 2);
                }

                // Add the sample to the song array
                sampleArr.push({
                    sampleRef: sampleId + '-' + y,
                    sample: sampleId,
                    timeSig: timeSig,
                    measure: measure,
                    beat: beat,
                    staffLine: line,
                    htmlPos: {
                        topMargin: event.layerY - 20,
                        leftMargin: 4
                    },
                    addtlSamples: new Array()
                });
                y++;
                // lightning.collectData(sampleArr);
            }
        } else {
            // Do nothing as the user has not clicked a sample yet
        }
    });

    $(".files").scroller();
    $(".stage").scroller({
        horizontal: true
    });

    Pace.on("done", function(){
        $(".pace-cover").fadeOut(500);
    });

    $('input[type=range]').change(function(){
        $('input#totalBPM').val($(this).val());
    });

    $('#timeSignature').click(function(e) {
        if (!$(this).hasClass('disabled')) {
            var i = 1, seq = $('#sequencer-input'),
                staff = $('.staff-lines'),
                seqLength = seq.width(),
                staffLength = staff.width();

            timeSig = e.target.parentElement.id;

            // Ensure the user didn't click out of range
            if (timeSig != 'timeSignature') {
                if (timeSig == '4_4') {
                    if ($('#measure001 .beat-4').hasClass('hide')){
                        // Toggle the button states
                        $('.threeFourImg').removeClass('toggle');
                        $('.fourFourImg').addClass('toggle');
                        $('.measure').each(function() {
                            $(this).find('.beat-4').removeClass('hide');
                            i++;
                        });
                        // Adjust the sequencer length
                        seqLength = (i > 1) ? seqLength + (i * 50) : seqLength;
                        staffLength = (i > 1) ? staffLength + (i * 50) : staffLength;
                    }
                } else {
                    if (!$('#measure001 .beat-4').hasClass('hide')){
                        // Toggle the button states
                        $('.threeFourImg').addClass('toggle');
                        $('.fourFourImg').removeClass('toggle');
                        $('.measure').each(function() {
                            $(this).find('.beat-4').addClass('hide');
                            i++;
                        });
                        // Adjust the sequencer length
                        seqLength = (i > 1) ? seqLength - (i * 50) : seqLength;
                        staffLength = (i > 1) ? staffLength - (i * 50) : staffLength;
                    }
                }
                seq.width(seqLength);
                staff.width(staffLength);
                // Reset the scroll bar
                $(".stage").scroller("reset");
            }
        }
    });

    $('.erase').click(function() {
        // Make sure the button's not disabled first
        if (!$(this).hasClass('disabled')) {
            lightning.updateUI('erase');

            lightning.hideMouseSample();

            $('.liveSample').click(function(e) {
                // Remove the element from the DOM
                $(e.target).remove();

                var id = e.target.dataset.sampleRef;
                for (var i=0; i < sampleArr.length; i++) {
                    if (sampleArr[i].sampleRef === id) {
                        sampleArr.splice(i, 1);
                    }
                }
            });
        }
    });
    // canvas.addEventListener('mousedown', function(event) {
    $('#mediaControls .playable').click(function(e) {
        var loop = (e.target.id == 'loop') ? true : false;
        playback();

        function playback() {
            var endPos = $('.staff-lines').width(),
                startPos = cursor.css('margin-left'),
                startPosNum = startPos.replace('px', ''),
                // BPM Range 358 - 600
                bpm = $('#totalBPM').val(),
                measures = ($('#measure-count').html()) * 1,
                beatNum = (timeSig == '3_3') ? 3 : 4,
                totalTime = ((measures * beatNum) / bpm) * 60000,
                // Shorten the distance of the screen so the viewport moves before
                // the cursor reaches the edge.
                screenDist = ($('.scroller-bar').width() - startPosNum) - 100,
                speed = endPos / totalTime,
                cursorStartTime = screenDist / speed;

            // Disable certain buttons
            lightning.updateUI('play');

            // Start moving the cursor towards the end
            cursor.animate({
                marginLeft: "+=" + (endPos - 115)
            }, totalTime, "linear", function() {
                // Animation complete.
                cursor.css('margin-left', startPos);
                $(".stage").scroller('scroll', 0);
                // Switch the buttons back to default
                lightning.updateUI('stop');
            });

            // Start the playback
            lightning.playback(sampleArr, totalTime, timeSig);

















            ///////////////////////////////////////////////////////////
            //TRYING TO FIGURE OUT WHAT TO DO WITH THE FOLLOWING BIT OF CODE IN
            //THE CASE WHERE THE USER CLICKED LOOP. PLAYING THROUGH ONCE IS SETUP
            //BELOW, BUT NEED TO FIGURE A WAY OUT TO SET IT TO LOOP IF LOOP=TRUE
            ///////////////////////////////////////////////////////////

            // Wait for the cursor to get to position where we need
            // to start scrolling
            var moveVP = setTimeout(function(){
                // Start moving the viewport...
                var cursorPos = (cursor.css('margin-left').replace('px', '')) * 1,
                remainingTime = totalTime - (
                    (cursorPos * .05)
                );
                $(".stage").scroller("scroll", (endPos - startPosNum), remainingTime);
            }, cursorStartTime);

            $('#stop').click(function() {
                lightning.stopPlayback(cursor, moveVP, startPos);
            });
        };

    });

    function moveIcons() {
        $('#sample-triggers > ul li').click(function(evt) {
            if (!$(this).hasClass('disabled')) {
                var $cursor = $('#mouse-sample');
                sampleId = $(this).attr('class');

                lightning.updateUI('add-sample');
                lightning.releaseEraser();

                $cursor.removeAttr('class')
                    .addClass('displayBlock')
                    .addClass(sampleId);

                $('.stage #sequencer-input').mousemove(function (evt) {
                    $cursor.removeClass('hide').addClass('displayBlock');
                    $cursor.css({
                        left:  evt.pageX + 10,
                        top:   evt.pageY + 10
                    });
                }).mouseleave(function() {
                    // Hide the sample as this could be confusing to the user
                    $cursor.removeClass('displayBlock').addClass('hide');
                });
            }
        });
    }

    $(document).keyup(function(e) {
        if (e.keyCode == 27) { // Esc key
            sampleId = null;
            lightning.hideMouseSample();
            lightning.releaseEraser();
            lightning.updateUI('stop');
        }
    });

    console.log('setting up sample triggers');
    // wire up sample icons to their backend calls
    lightning.setupSampleTriggers(moveIcons);

});
