var lightningApp = angular.module('lightningApp', ['ngRoute']);

// configure our routes
lightningApp.config(['$routeProvider', '$locationProvider','$provide' ,
function($routeProvider, $locationProvider, $provide) {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $routeProvider
    .when('/', {
        templateUrl : 'views/main.html',
        controller  : 'mainController'
    })

    .otherwise({redirectTo: '/'});
}]);


/* *****************************************
* CUSTOM DIRECTIVES
* ***************************************** */
lightningApp.directive("setupLightning", [
    function() {
        return {
            restrict: "A",
            link: function(scope, elm, attrs) {
                $(".files").scroller();
                $(".stage").scroller({
                    horizontal: true
                });

                Pace.on("done", function(){
                    $(".pace-cover").fadeOut(500, function() {
                        // Show the entire page
                        $('html').removeClass('load');
                    });
                });
            }
        };
    }
]);

lightningApp.directive("addSampleMode", [
    function() {
        return {
            restrict: "A",
            link: function(scope, elm, attrs) {
                "use strict";
                elm.click(function(e) {
                    e.preventDefault();

                    if (!elm.hasClass('disabled')) {
                        var $mouseFollow = $('#mouse-sample'), selectedSmp = attrs.addSampleMode;

                        lightning.updateUI('add-sample');
                        lightning.releaseEraser();

                        $mouseFollow.removeAttr('class')
                            .addClass('displayBlock')
                            .addClass(selectedSmp)
                            .attr('data-selected-sample', selectedSmp);

                        $('#sequencer-input').mousemove(function (evt) {
                            // Have the icon follow the mouse around the sequencer
                            $mouseFollow.removeClass('hide').addClass('displayBlock');
                            $mouseFollow.css({
                                left:  evt.pageX + 10,
                                top:   evt.pageY + 10
                            });
                        }).mouseleave(function() {
                            // Hide the sample when the mouse leaves the sequencer
                            // as this could be confusing to the user
                            $mouseFollow.removeClass('displayBlock').addClass('hide');
                        });
                    }
                });
            }
        };
    }
]);

lightningApp.directive("sequencerInput", [
    function() {
        return {
            restrict: "A",
            link: function(scope, elm, attrs) {
                elm.click(function(event) {
                    var target = event.target.className, y = 0,
                        sampleId = $('#mouse-sample').attr('data-selected-sample');

                    if (target == 'addMeasure') {
                        // var measureId = ($('#measure-count').html())*1,
                        var seqWidth = $('#sequencer-input').width(),
                            staffWidth = $('.staff-lines').width(),
                            mWidth = $('#measure001').width(),
                            measureTpl = _.template($('#measure-template').html(),
                                {
                                    measureId: scope.measureCount
                                });

                        // Add the sample to the DOM
                        $('#extraMeasures').append(measureTpl);
                        // Update the data-measures count
                        scope.$apply(function() {
                            scope.measureCount++;
                        });
                        $('#sequencer-input').css('width', (seqWidth + mWidth) + 'px');
                        $('.staff-lines').width((staffWidth + mWidth) + 'px');
                        $(".stage").scroller("reset");

                    } else if (sampleId !== undefined && (!$('#sequencer-input').hasClass('delMode'))) {
                        // User didn't click on addMeasure, the only other thing they could
                        // have clicked on is it's parent element... #sequencer-input
                        var beatId = target,
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
                            if ((measureId) && measureId != '') {
                                $('#' + measureId + ' .' + beatId).append(sampleTpl);
                            }

                            if (line == 'll-' && lNum < 8) {
                                line += lNum;
                            } else if (line == 'll-' && lNum > 7) {
                                line += (lNum - 5);
                            } else if (line == 'sl-' && lNum < 8) {
                                line += (lNum - 2);
                            }

                            // Add the sample to the song array
                            scope.sampleArr.push({
                                sampleRef: sampleId + '-' + y,
                                sample: sampleId,
                                measure: measure,
                                beat: beat,
                                staffLine: line,
                                vertPos: event.layerY - 20,
                                addtlSamples: new Array()
                            });
                            y++;
                            // lightning.collectData(sampleArr);
                        }
                    } else {
                        // Do nothing as the user has not clicked a sample yet
                    }
                });
            }
        };
    }
]);

lightningApp.directive("updateTimeSig", [
    function() {
        return {
            restrict: "A",
            link: function(scope, elm, attrs) {
                elm.click(function(){
                    if (!elm.hasClass('disabled')) {
                        var i = 1,
                        seq = $('#sequencer-input'),
                        staff = $('.staff-lines'),
                        seqLength = seq.width(),
                        staffLength = staff.width();

                        scope.timeSig = attrs.updateTimeSig;

                        if (scope.timeSig == 4) {
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
                });
            }
        };
    }
]);

lightningApp.directive("eraseNote", [
    function() {
        return {
            restrict: "A",
            link: function(scope, elm, attrs) {
                elm.click(function(){
                    // Make sure the button's not disabled first
                    if (!elm.hasClass('disabled')) {
                        lightning.updateUI('erase');

                        lightning.hideMouseSample();

                        $('.liveSample').click(function(e) {
                            // Remove the element from the DOM
                            $(e.target).remove();

                            var id = e.target.dataset.sampleRef;
                            for (var i=0; i < scope.sampleArr.length; i++) {
                                if (scope.sampleArr[i].sampleRef === id) {
                                    scope.sampleArr.splice(i, 1);
                                }
                            }
                        });
                    }
                });
            }
        };
    }
]);

lightningApp.directive("playSequence", [
    function() {
        return {
            restrict: "A",
            link: function(scope, elm, attrs) {
                elm.click(function(){
                    var loop = (attrs.id == 'loop') ? true : false;
                    playback();

                    function playback() {
                        var cursor =$('[data-cursor=true]'),
                            endPos = $('.staff-lines').width(),
                            startPos = cursor.css('margin-left'),
                            startPosNum = startPos.replace('px', ''),
                            bpm = $('#totalBPM').val(),
                            measures = scope.measureCount,
                            totalTime = ((measures * scope.timeSig) / bpm) * 60000,
                            // Shorten the distance of the screen so the viewport moves before
                            // the cursor reaches the edge.
                            screenDist = ($('.scroller-bar').width() - startPosNum) - 100,
                            speed = endPos / totalTime,
                            cursorStartTime = screenDist / speed;

                        // Disable certain buttons
                        var btn = (loop) ? lightning.updateUI('loop') : lightning.updateUI('play');

                        function animateCursor() {
                            cursor.animate({
                                marginLeft: "+=" + (endPos - 115)
                            }, totalTime, "linear", function() {
                                // Animation complete.
                                cursor.css('margin-left', startPos);
                                $(".stage").scroller('scroll', 0);
                                // Switch the buttons back to default
                                var btnStop = (loop) ? '' : lightning.updateUI('stop');
                            });
                        };
                        function playbackSamples() {
                            lightning.playback(scope.sampleArr, scope.timeSig);
                        };
                        function animateVP() {
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
                        function runAnim() {
                            animateCursor();
                            playbackSamples();
                            animateVP();
                        };

                        if (loop) {
                            runAnim();
                            var test = setInterval(function(){
                                runAnim();
                            }, totalTime);
                        } else {
                            runAnim();
                        }
                    };



                });
            }
        };
    }
]);

lightningApp.directive("updateBpm", [
    function() {
        return {
            restrict: "A",
            link: function(scope, elm, attrs) {
                elm.change(function(){
                    $('input#totalBPM').val($(this).val());
                });
            }
        };
    }
]);










/* *****************************************
* CUSTOM FILTERS
* ***************************************** */
lightningApp.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
            input.push(i);
        return input;
    };
});
