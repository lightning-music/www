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
                        var path = attrs.addSampleMode;
                        lightning.playSample(path, 60, 96);

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
                    var target = event.target.className, y = 0, targetPos = event.target.id,
                        sampleId = $('#mouse-sample').attr('data-selected-sample');

                    if (target == 'addMeasure') {
                        var seqWidth = $('#sequencer-input').width(),
                            staffWidth = $('.staff-lines').width(),
                            mWidth = $('#measure001').width();

                        // Update the data-measures count
                        scope.$apply(function() {
                            scope.measureCount++;
                        });
                        // Adjust any manual widths
                        $('#sequencer-input').css('width', (seqWidth + mWidth) + 'px');
                        $('.staff-lines').width((staffWidth + mWidth) + 'px');
                        $(".stage").scroller("reset");

                    } else if (sampleId !== undefined && (!$('#sequencer-input').hasClass('delMode'))) {
                        // User didn't click on addMeasure, the only other thing they could
                        // have clicked on is it's parent element... #sequencer-input

                        if ((event.offsetY / 32) > 0.5) {
                            var sampleTpl = _.template($('#live-sample-template').html(),
                                {
                                    // Margins are offset to account for the tile image size,
                                    // and for centering within the measure.
                                    sampleMargins: (event.offsetY - 20) + 'px 0 0 4px',
                                    sampleName: sampleId,
                                    sampleRef: sampleId + '-' + y
                                });
                            // Add the sample to the DOM
                            $('#' + targetPos).append(sampleTpl);

                            // Add the sample to the song array
                            scope.sampleArr.push({
                                sampleRef: sampleId + '-' + y,
                                sample: sampleId,
                                position: targetPos,
                                vertPos: event.offsetY - 20,
                                addtlSamples: new Array()
                            });

                            // Play the sample back for the user
console.log('sampleId', sampleId);
                            var path = sampleId,
                                sampleAttr = lightning.getNoteVelocity(event.offsetY - 20);
                            lightning.playSample(path, sampleAttr.pitch, sampleAttr.velocity);

                            // increment the index for unique sample references
                            y++;
                        }
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
                        var activeBtn = (attrs.updateTimeSig == 3) ? 'threeFourImg' : 'fourFourImg';
                        $('#timeSignature div').each(function() {
                            $(this).removeClass('toggle');
                        });
                        $('.' + activeBtn).addClass('toggle');
                        scope.$apply(function() {
                            scope.timeSig = attrs.updateTimeSig;
                        });

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
