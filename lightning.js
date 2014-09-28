// Abstraction for controlling a lightning backend.
function Lightning(options) {
  var self = this;
  options = options || {};

  // websocket wrapper
  function WS(addr) {
    var self = this;
    self.__conn = new WebSocket(addr);
    self.__events = {
      open: function(handler) {
        self.__conn.onopen = handler;
      },
      message: function(handler) {
        self.__conn.onmessage = handler;
      }
    };
  }

  WS.prototype.on = function(type, handler) {
    var self = this;
    if (typeof type !== 'string' || !(type in self.__events)) {
      throw new TypeError('unrecognized type: ' + type);
    }
    self.__events[type](handler);
  };

  WS.prototype.send = function(msg) {
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg);
    }
    this.__conn.send(msg);
  };

  WS.create = function(addr) {
    return new WS(addr);
  };

  // setup new Lightning instance

  self.__wsAddr = options.ws || "ws://localhost:3428";
  self.__httpAddr = options.http || "http://localhost:3428";

  self.__samplePlay = WS.create(self.__wsAddr + "/sample/play");
  self.__samplePlay.on('open', function(event) {
    console.log("connected to /samples/play websocket endpoint");
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
