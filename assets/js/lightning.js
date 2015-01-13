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

Lightning.prototype.playback = function(sArr) {
    var self = this;
    sArr.sort(lightning.arrangePlayback("measure","beat","staffLine"));
    // self.playSample("cow.wav", 60, 96);
    // console.dir(sArr);
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

Lightning.prototype.collectData = function(data) {
    // Not completely sure what to do with this data for now, so
    // just returning it to the screen
    $('.devMode').removeClass('hide').html(JSON.stringify(data, null, 4));
    $('.devModeToggle').removeClass('hide');
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
