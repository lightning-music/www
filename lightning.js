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
      f(null, samples);
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
  this.__patternEdit.send({
  });
};

Lightning.prototype.stop = function() {
  this.__patternEdit.send({
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
