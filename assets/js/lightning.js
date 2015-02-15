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

    // endpoint used to add notes
    self.__addNote = WS.create(self.__wsAddr + "/note/add");
    self.__addNote.on('open', function(event) {
        console.log("connected to /note/add websocket endpoint");
    });

    // endpoint used to remove notes
    self.__removeNote = WS.create(self.__wsAddr + "/note/remove");
    self.__removeNote.on('open', function(event) {
        console.log("connected to /note/add websocket endpoint");
    });

    // endpoint used to begin playback
    self.__play = WS.create(self.__wsAddr + "/pattern/play");
    self.__play.on('open', function(event) {
        console.log("connected to /pattern/play websocket endpoint");
    });

    // endpoint used to stop playback
    self.__stop = WS.create(self.__wsAddr + "/pattern/stop");
    self.__stop.on('open', function(event) {
        console.log("connected to /pattern/stop websocket endpoint");
    });

    // endpoint used for receiving pattern position
    self.__pos = WS.create(self.__wsAddr + "/pattern/position");
    self.__pos.on('open', function(event) {
        console.log("connected to /pattern/position websocket endpoint");
    });

    self.__events = {
        // handler for sequencer position messages
        // Usage:
        // lightning.on('pattern:position', function(position) {
        // });
        'pattern:position': function(handler) {
          self.__pos.on('message', function(data) {
            console.log(data);
          });
        }
    };
}

Lightning.prototype.on = function(type, handler) {
    var self = this;
    if (typeof type !== 'string' || !(type in self.__events)) {
        throw new TypeError('invalid event type: ' + type);
    }
    self.__events[type](handler);
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

// strip the extension from a sample path
function stripExtension(path) {
    var wi = path.lastIndexOf('.');
    return path.substring(0, wi);
}

Lightning.prototype.playSample = function(path, note, vel) {
    var self = this;
    self.__samplePlay.send({
        sample: path,
        number: note,
        velocity: vel
    });
};

Lightning.prototype.getSamplePath = function(scope, sample) {
    var path = '';
    for (var i=0; i<(scope.samples).length; i++) {
        if (stripExtension(scope.samples[i].path) == sample) {
            path = scope.samples[i].path;
        }
    }
    return path;
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

Lightning.prototype.getNoteVelocity = function(val) {
    /*
    * This function calculates the note and velocity based of of the position
    * of the sample within the DOM. IF/ELSE is used as it is supposed to be faster
    * than a switch statement.
    *
    * @val = The vertical position of the sample (in pixels) within the
    *        sequencer-input
    *
    * @RETURN = A JSON object containing the value of the note and velocity of
    *           the sample.
    */
    var result = {};
    if (val <= 32) {                            // Ledger-Line 1
        result = { pitch: 80, velocity: 96};
    } else if (val >= 33 && val <= 66) {        // Ledger-Line 2
        result = { pitch: 75, velocity: 96};
    } else if (val >= 67 && val <= 100) {       // Staff-Line 1
        result = { pitch: 70, velocity: 96};
    } else if (val >= 101 && val <= 132) {      // Staff-Line 2
        result = { pitch: 65, velocity: 96};
    } else if (val >= 133 && val <= 164) {      // Staff-Line 3
        result = { pitch: 60, velocity: 96};
    } else if (val >= 165 && val <= 198) {      // Staff-Line 4
        result = { pitch: 58, velocity: 100};
    } else if (val >= 199 && val <= 232) {      // Staff-Line 5
        result = { pitch: 55, velocity: 104};
    } else if (val >= 233 && val <= 262) {      // Ledger-Line 4
        result = { pitch: 53, velocity: 108};
    } else if (val >= 263) {                    // Ledger-Line 5
        result = { pitch: 50, velocity: 112};
    }
    return result;
};

Lightning.prototype.collectMultiple = function(arr) {
    /*
    * This function looks for notes on the same beat/measure, and adds them to
    * the first sample's addtlSamples property as an array of objects.
    * The additional notes on the same measure are then flagged as dropped.
    *
    * @arr = The array of samples as well as their associated attributes
    *
    * @RETURN = The final organized array with any notes on the same beat/measure
    *           in an array under addtlSamples.
    */
    var dupArr = arr, finalArr = new Array(), y = 0,
        findMatches = function(beat, measure, sampleRef) {
            var output = new Array(), sampleAttr;
            for (var i=0; i<dupArr.length; i++) {
                dupArr[i]._drop = false;
                if (!dupArr[i]._drop) {
                    if (dupArr[i].beat == beat && dupArr[i].measure == measure &&
                        (dupArr[i].sampleRef != sampleRef)) {
                        // Calculate the note/velocity
                        sampleAttr = lightning.getNoteVelocity(dupArr[i].vertPos);
                        output.push({
                            sample: dupArr[i].sample,
                            pitch: sampleAttr.pitch,
                            velocity: sampleAttr.velocity
                        });
                        dupArr[i]._drop = true;
                    }
                }
            }
            return output;
        };

    for (var i=0; i<arr.length; i++) {
        y++;
        if (arr[i] && arr[y] && !arr[i]._drop) {
            // Look for a match
            var matches = findMatches(arr[i].beat, arr[i].measure, arr[i].sampleRef);
            for (var x=0; x<matches.length; x++) {
                arr[i].addtlSamples.push(matches[x]);
            }
            finalArr.push(arr[i]);
        } else if (arr[i] && !arr[i]._drop) {
            finalArr.push(arr[i]);
        }
    }
    return finalArr;
};

Lightning.prototype.dynamicSort = function(property) {
    /*
    * This function takes a property name and returns a function that can be used
    * to sort multiple objects
    *
    * @property = The name of the object property to sort by
    *
    * @RETURN = An anonymous function that calculates the greater of the two
    *           objects properties
    */
    return function (obj1,obj2) {
        return obj1[property] > obj2[property] ? 1
        : obj1[property] < obj2[property] ? -1 : 0;
    }
};

Lightning.prototype.arrangePlayback = function() {
    /*
    * This function takes the two objects from the sort method and compares
    * the properties of each.
    *
    * @default[arr] = The array of object property names to use in the comparison
    *
    * @RETURN = The value returned from dynamicSort return's function
    */
    var props = arguments;
    return function (obj1, obj2) {
        var i = result = 0, numberOfProperties = props.length;
        while(result === 0 && i < numberOfProperties) {
            // Pass the object's property name to dynamicSort and apply the
            // returned function to the two objects from the sample array's
            // sort method
            result = lightning.dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
};

Lightning.prototype.playback = function(sArr, timeSig) {
    /*
    * This function prepares the final playback of the samples based on
    * the sorted array of samples, the overall time signature, and the scale of
    * the samples and sends it off to be played
    *
    * @sArr[arr] = The array of samples as well as their associated attributes
    *
    * @timeSig = The value of the time signature switch
    *
    * @RETURN = N/A
    */
    var self = this, fullMeasure = (timeSig == 3) ? 150 : 200;
    sArr.sort(lightning.arrangePlayback("measure","beat","staffLine"));

    sArr = lightning.collectMultiple(sArr);
    for (var i=0; i<sArr.length; i++) {
        var noteAttrs = lightning.getNoteVelocity(sArr[i].vertPos),
            sample = {
                name: sArr[i].sample,
                pitch: noteAttrs.pitch,
                velocity: noteAttrs.velocity,
                position: ((sArr[i].measure - 1) * fullMeasure) + (sArr[i].beat * 50)
            };
        var run = lightning.sendSamples(sample, sArr[i].addtlSamples, self);
    };
};

Lightning.prototype.sendSamples = function(smpInfo, addtlSmpls, self) {
    /*
    * This function sends the sample (name/note/velocity) across for playback
    * when the cursor position passes over the position of a given sample's
    * location on the sequencer. This function will also loop through the
    * additional samples array and send them off in the same instant for
    * playback.
    *
    * @smpInfo[obj] = A json object containing playback information about the
    *                 sample:
    *                   {
    *                       name[str]:      The name of the sample that
    *                                       corresponds to the file name
    *                       pitch[int]:     The numeric value of the note's pitch
    *                       velocity[int]:  The numeric value of the note's
    *                                       velocity
    *                       position[int]:  The numeric value of the sample's
    *                                       position
    *                   }
    *
    * @addtlSmpls[arr] = An array containing json object with info about any
    *                    additional samples
    *                   [{
    *                       sample[str]:      The name of the sample that
    *                                       corresponds to the file name
    *                       pitch[int]:     The numeric value of the note's pitch
    *                       velocity[int]:  The numeric value of the note's
    *                                       velocity
    *                   }]
    *
    *
    * @self = Lightning abstraction
    *
    * @RETURN = N/A
    */
    var cursor =$('[data-cursor=true]'), cursorPos = 0, smpPos = 0;

    function stopSample() {
        clearInterval(findOverlap);
    }

    var findOverlap = setInterval(function() {
        // Loop every 50ms until the cursor passes over a given sample
        cursorPos = Math.round((cursor.css('margin-left').replace('px', '')) * 1);
        smpPos = smpInfo.position + 50;

        if (cursorPos > smpPos) {
            self.playSample(smpInfo.name + ".wav", smpInfo.pitch, smpInfo.velocity);
            for (var i=0; i<addtlSmpls.length; i++) {
                self.playSample(addtlSmpls[i].sample + ".wav", addtlSmpls[i].pitch, addtlSmpls[i].velocity);
            }
            stopSample();
            return;
        }
    }, 10);
};

Lightning.prototype.hideMouseSample = function() {
    /*
    * This function removes the sample from the mouse, and takes the sequencer
    * out of the addNote Mode.
    *
    * @RETURN = N/A
    */
    $('#mouse-sample')
        .removeAttr('class')
        .removeClass('displayBlock')
        .attr('data-selected-sample', '');
    $('#sequencer-input').removeClass('addNoteMode');
};

Lightning.prototype.deleteMode = function(d) {
    /*
    * This function either puts the sequencer in delete mode, or takes it out
    *
    * @d[bool] = Boolean to determine if to put the sequencer in delete mode
    *            or take it out of delete mode.
    *
    * @RETURN = N/A
    */
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
            // $('#sequencer-input').addClass('addNoteMode');
            break;
        default:
            //
            break;
    }
};

Lightning.prototype.releaseEraser = function() {
    lightning.updateUI('stop');
    lightning.deleteMode(false);
};

Lightning.prototype.stopPlayback = function(c, v, s) {
    c.stop();
    clearTimeout(v);
    c.css('margin-left', s);
    $(".stage").scroller("scroll", 0);



    lightning.hideMouseSample();
    lightning.releaseEraser();
    lightning.updateUI('stop');
};

Lightning.prototype.addNote = function(pos, sample, note, vel) {
  var self = this;
  self.__addNote.send([
    {
      pos: pos,
      note: {
        sample: sample,
        number: note,
        velocity: vel
      }
    }
  ]);
};

Lightning.prototype.removeNote = function(pos, sample, note, vel) {
    var self = this;
    self.__removeNote.send({
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
