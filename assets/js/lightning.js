// Abstraction for controlling a lightning backend.
function Lightning(options) {
    var self = this;
    options = options || {};

    // setup new Lightning instance

    self.__wsAddr = options.ws || "ws://localhost:3428";
    self.__httpAddr = options.http || "http://localhost:3428";

    self.__samplePlay = WS.create(self.__wsAddr + "/sample/play");
    self.__samplePlay.on('open', function(event) {
        console.log("connected to /samples/play websocket endpoint");
    });

    self.__patternEdit = WS.create(self.__wsAddr + "/pattern");
    self.__patternEdit.on('open', function(event) {
        console.log("connected to /pattern websocket endpoint");
    });

    self.__play = WS.create(self.__wsAddr + "/pattern/play");
    self.__play.on('open', function(event) {
        console.log("connected to /pattern/play websocket endpoint");
    });

    self.__stop = WS.create(self.__wsAddr + "/pattern/stop");
    self.__stop.on('open', function(event) {
        console.log("connected to /pattern/stop websocket endpoint");
    });

    self.__events = {
        // handler for sequencer position messages
        'seq:pos': function(handler) {
        }
    };
}

Lightning.prototype.on = function(type, handler) {
    var self = this;
    if (typeof type !== 'string' || !(type in self.__events)) {
        throw new TypeError('invalid event type: ' + type);
    }
};

Lightning.prototype.listSamples = function(f) {
    var self = this;
    $.ajax({
        type: 'GET',
        url: self.__httpAddr + "/samples",
        error: function() {
            f(new Error("error getting samples list"), null);
        },
        success: function(samples) {
            f(null, JSON.parse(samples));
        }
    });
};

Lightning.prototype.playSample = function(path, note, vel) {
    var self = this;
    self.__samplePlay.send({
        sample: path,
        number: note,
        velocity: vel
    });
};

// strip the .wav extension from a sample path
function stripExtension(path) {
    var wi = path.lastIndexOf('.wav');
    return path.substring(0, wi);
}

Lightning.prototype.setupSampleTriggers = function(f) {
    var self = this;
    this.listSamples(function(err, samples) {
        if (err) {
            return f(err);
        }
        samples.forEach(function(sample) {
            var c = stripExtension(sample.path);
            var el = $('li.' + c);
            el.click(function(ev) {
                self.playSample(sample.path, 60, 96);
                ev.preventDefault();
            });
        });
        return f(null);
    });
};

Lightning.prototype.toggleBtns = function(on) {
    // Check to make sure the button exists
    if (on == 'play' ||
        on == 'stop' ||
        on == 'loop' ||
        on == 'erase') {
            $('.mediaControls div').each(function() {
                if ($(this).attr('id') == on) {
                    $(this).addClass('toggle');
                } else {
                    $(this).removeClass('toggle');
                }
            });
        }
};

Lightning.prototype.collectMultiple = function(arr) {
    var abort = '---', dupArr = arr, finalArr = new Array();

    var findMatches = function(beat, measure, sampleRef) {
        var output = new Array();
        for (var i=0; i<dupArr.length; i++) {
            if (dupArr[i].sample != abort) {
                // Holy shit, it never made it to the comparison of the last 2 elements (piano crow)
                if (dupArr[i].beat == beat && dupArr[i].measure == measure &&
                    (dupArr[i].sampleRef != sampleRef)) {
                    output.push(dupArr[i].sample);
                    dupArr[i].sample = abort;
                }
            }
        }
        return output;
    };

    var y = 0;
    for (var i=0; i<arr.length; i++) {
        y++;
        if (arr[i] && arr[y] && arr[i].sample != abort) {
            // Look for a match
            var matches = findMatches(arr[i].beat, arr[i].measure, arr[i].sampleRef);

            for (var x=0; x<matches.length; x++) {
                arr[i].addtlSamples.push(matches[x]);
            }

            finalArr.push(arr[i]);
        } else if (arr[i] && arr[i].sample != abort) {
            finalArr.push(arr[i]);
        }
    }

    return finalArr;
};

Lightning.prototype.dynamicSort = function(property) {
    return function (obj1,obj2) {
        return obj1[property] > obj2[property] ? 1
        : obj1[property] < obj2[property] ? -1 : 0;
    }
}

Lightning.prototype.arrangePlayback = function() {
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        while(result === 0 && i < numberOfProperties) {
            result = lightning.dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}

Lightning.prototype.playback = function(sArr, time, timeSig) {
    var self = this, fullMeasure = (timeSig == '3_3') ? 150 : 200;
    sArr.sort(lightning.arrangePlayback("measure","beat","staffLine"));

    sArr = lightning.collectMultiple(sArr);
    for (var i=0; i<sArr.length; i++) {
        var calcTime = ((sArr[i].measure - 1) * fullMeasure) + (sArr[i].beat * 50),
            cursorPos, sample = sArr[i].sample;
        var run = lightning.sendSamples(calcTime, sample, sArr[i].addtlSamples, self);
    };
};

Lightning.prototype.sendSamples = function(calcTime, sample, addtl, self) {
    var cursor =$('[data-cursor=true]');

    function stopSample() {
        clearInterval(myVar);
    }

    var sendSample = setInterval(function() {
        cursorPos = (cursor.css('margin-left').replace('px', '')) * 1;
        if (cursorPos > (calcTime + 50)) {
            self.playSample(sample + ".wav", 60, 96);
            for (var i=0; i<addtl.length; i++) {
                self.playSample(addtl[i] + ".wav", 60, 96);
            }
            stopSample();
            return;
        }
    }, 50);
};

Lightning.prototype.hideMouseSample = function() {
    $('#mouse-sample').removeAttr('class').removeClass('displayBlock');
    $('#sequencer-input').removeClass('addNoteMode');
};

Lightning.prototype.deleteMode = function(d) {
    if (d) {
        $('#sequencer-input').addClass('delMode');
    } else {
        $('#sequencer-input').removeClass('delMode');
    }

};

Lightning.prototype.updateUI = function(t) {
    lightning.toggleBtns(t);

    function disableMode(b) {
        if (b) {
            $('#loop').addClass('disabled');
            $('#erase').addClass('disabled');
            $('#timeSignature').addClass('disabled');
            $('.sampleList > li').each(function() {$(this).addClass('disabled'); });
        } else {
            $('#loop').removeClass('disabled');
            $('#erase').removeClass('disabled');
            $('#timeSignature').removeClass('disabled');
            $('.sampleList > li').each(function() {$(this).removeClass('disabled'); });
        }
    };

    switch(t) {
        case 'play':
            lightning.deleteMode(false);
            disableMode(true);
            lightning.hideMouseSample();
            break;
        case 'erase':
            lightning.deleteMode(true);
            break;
        case 'stop':
            lightning.deleteMode(false);
            disableMode(false);
            break;
        case 'add-sample':
            lightning.deleteMode(false);
            $('#sequencer-input').addClass('addNoteMode');
            break;
        default:
            //default code block
            break;
    }
};

Lightning.prototype.releaseEraser = function() {
    lightning.toggleBtns('stop');
    lightning.deleteMode(false);
};

Lightning.prototype.stopPlayback = function(c, v, s) {
    c.stop();
    clearTimeout(v);
    c.css('margin-left', s);
    lightning.toggleBtns('stop');
    $(".stage").scroller("scroll", 0);
};

Lightning.prototype.addNote = function(pos, sample, note, vel) {
    var self = this;
    self.__patternEdit.send({
        pos: pos,
        note: {
            sample: sample,
            number: note,
            velocity: vel
        }
    });
};

Lightning.prototype.play = function() {
    this.__patternPlay.send({
    });
};

Lightning.prototype.stop = function() {
    this.__patternStop.send({
    });
};

// Lightning.prototype.collectData = function(data) {
//     // Not completely sure what to do with this data for now, so
//     // just returning it to the screen
//     $('.devMode').removeClass('hide').html(JSON.stringify(data, null, 4));
//     $('.devModeToggle').removeClass('hide');
// };

Lightning.getInstance = (function() {
    var INSTANCE;
    return function() {
        if (INSTANCE === undefined) {
            INSTANCE = new Lightning();
        }
        return INSTANCE;
    };
})();

window.lightning = new Lightning();
