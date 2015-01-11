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
            totalTime = 5000, distToTravel = endPos + startPosNum,
            screenSize = $('.scroller-bar').width(),
            // How many screens fit into the total distance?
            screenNum = distToTravel / screenSize,
            // How long does it take for the cursor to complete one screen?
            screenTime = Math.round(totalTime / 1.8);

        // console.log('Screen Num:' + screenNum);
        // console.log('Start position: ' + startPos);
        // console.log('Length of screen: ' + screenSize);
        // console.log('End position: ' + endPos);
        // console.log('Time to traverse 1 screen = ' + screenTime);
        // console.log('Total time = ' + totalTime);
        // console.log(Date.now());
        var screenDist = $('.scroller-bar').width() - startPosNum,
            speed = endPos / totalTime,
            cursorStartTime = screenDist / speed;

        console.log('what is my speed: ' + speed + 'ppm');
        console.log('distance between staff & edge: ' + screenDist);
        console.log('At what time does the cursor cross the edge: ' + cursorStartTime);


        cursor.animate({
            marginLeft: "+=" + endPos
        }, totalTime, function() {
            // Animation complete.
            cursor.css('margin-left', startPos);
        });

        // Wait for the cursor to get to position where we need
        // to start scrolling
        setTimeout(function(){
            console.log('WTF is the position of the cursor now: ' + cursor.css('margin-left'));
            console.log('Its ready!!!!!! ' + Date.now());
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
