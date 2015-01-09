
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
