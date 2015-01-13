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
    sampleId = null;

    var trigs = new Lightning.Views.SampleTriggers({
        el: '#sample-triggers'
    });

    // TODO: have classes be able to register themselves as click listeners

    canvas.addEventListener('mousedown', function(event) {
        var pos = mousePos(event);
        if (sampleId !== null) {
            var beatId = event.target.className,
                measureId = event.target.parentElement.id,
                lNum = Math.round(event.layerY / 32),
                line = ((lNum > 0 && lNum < 3) || lNum > 7) ? 'll-' : 'sl-',
                beat = beatId.charAt(beatId.length - 1),
                measure = measureId.charAt(measureId.length - 1);

            if ((event.layerY / 32) > 0.5) {
                template = _.template($('#live-sample-template').html(),
                {
                    // Margins are offset to account for the tile image size,
                    // and for centering within the measure.
                    sampleMargins: (event.layerY - 20) + 'px 0 0 4px',
                    sampleName: sampleId,
                    sampleRef: sampleId + '-' + y
                });

                // Add the sample to the DOM
                $('#' + measureId + ' .' + beatId).append(template);

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
                    musicPos: {
                        measure: measure,
                        beat: beat,
                        staffLine: line
                    },
                    htmlPos: {
                        topMargin: event.layerY - 20,
                        leftMargin: 4
                    }
                });
                y++;
                lightning.collectData(sampleArr);
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
        $(".pace-cover").fadeOut(2000);
    });

    $('#timeSignature').click(function(e) {
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

            // Hand the data off
            lightning.collectData(new Array(timeSig));
        }
    });

    $('.erase').click(function() {
        $('.controls').addClass('delMode');
        $('.stage').addClass('delMode');
        // Show the help text
        $('#helpText').fadeIn(500);

        $('.liveSample').click(function(e) {
            // Remove the element from the DOM
            $(e.target).remove();

            var id = e.target.dataset.sampleRef;
            for (var i=0; i < sampleArr.length; i++) {
                if (sampleArr[i].sampleRef === id) {
                    sampleArr.splice(i, 1);
                }
            }
            lightning.collectData(sampleArr);
        });
    });

    $('#play').click(function() {
        var endPos = $('.staff-lines').width(), cursor =$('[data-cursor=true]'),
            startPos = cursor.css('margin-left'),
            startPosNum = startPos.replace('px', '');
            totalTime = 5000,
            // Shorten the distance of the screen so the viewport moves before
            // the cursor reaches the edge.
            screenDist = ($('.scroller-bar').width() - startPosNum) - 100,
            speed = endPos / totalTime,
            cursorStartTime = screenDist / speed;

        // Start moving the cursor towards the end
        cursor.animate({
            marginLeft: "+=" + (endPos - 115)
        }, totalTime, "linear", function() {
            // Animation complete.
            cursor.css('margin-left', startPos);
        });

        // Wait for the cursor to get to position where we need
        // to start scrolling
        setTimeout(function(){
            // Start moving the viewport...
            var cursorPos = (cursor.css('margin-left').replace('px', '')) * 1,
                remainingTime = totalTime - (
                    (cursorPos * .05)
                );
            $(".stage").scroller("scroll", (endPos - startPosNum), remainingTime);
        }, cursorStartTime);

    });

    $('.devModeToggle').click(function() {
        var devMode = $('.devMode'), toggle = $('.devModeToggle');
        if (devMode.hasClass('hide')) {
            devMode.removeClass('hide');
            toggle.removeClass('docked').html('<<');
        } else {
            devMode.addClass('hide');
            toggle.addClass('docked').html('>>');
        }
    });

    function moveIcons() {
        $('#sample-triggers > ul li').click(function(evt) {
            var $cursor = $('#mouse-sample');
            sampleId = $(this).attr('class');

            $cursor.removeAttr('class')
                .addClass('displayBlock')
                .addClass(sampleId);

            // Show the help text
            $('#helpText').fadeIn(500);
            // Set the sequencer it input mode for correct css
            $('#sequencer-input').addClass('addNoteMode');

            $('.stage').mousemove(function (evt) {
                $cursor.css({
                    left:  evt.pageX + 10,
                    top:   evt.pageY + 10
                });
            });
        });
    }

    $(document).keyup(function(e) {
        if (e.keyCode == 27) { // Esc key
            sampleId = null;
            // Reset the cursor state if necessary
            $('#mouse-sample').removeAttr('class');
            // Reset the delete mode state if necessary
            $('.controls').removeClass('delMode');
            $('.stage').removeClass('delMode');
            // Hide the help text
            $('#helpText').fadeOut(500);
        }
    });

    console.log('setting up sample triggers');
    // wire up sample icons to their backend calls
    lightning.setupSampleTriggers(moveIcons);

});
