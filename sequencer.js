Lightning.Sequencer = function(options) {
  options = options || {};

  var self = this,
      id;

  if (typeof options.id === 'string') {
    id = options.id;
  } else {
    id = 'sequencer-input';
  }

  this.__canvas = document.getElementById('sequencer-input');
  this.__ctx = this.__canvas.getContext('2d');
  this.__boundary = this.__canvas.getBoundingClientRect();

  var mousePos = function(event) {
    return {
      x: event.clientX - self.__boundary.left,
      y: event.clientY - self.__boundary.top
    };
  };

  this.__events = {
    'mouse:move': function(handler) {
      self.__canvas.addEventListener('mousemove', function(event) {
        handler(mousePos(event));
      });
    }
  };
};

Lightning.Sequencer.prototype.on = function(type, handler) {
  var self = this;
  if (typeof type !== 'string' || !(type in self.__events)) {
    throw new TypeError('invalid type: ' + type);
  }
  this.__events[type](handler);
};
