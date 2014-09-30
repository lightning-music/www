Lightning.Sequencer = function(options) {
  options = options || {};

  var self = this,
      elid = options.id;

  this.__canvas = document.getElementById(elid);
  this.__width = this.__canvas.width;
  this.__height = this.__canvas.height;
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
    },
    'mouse:down': function(handler) {
      self.__canvas.addEventListener('mousedown', function(event) {
        handler(mousePos(event));
      });
    }
  };

  // draw grid

  var x, y,
      hcells = 32,
      vcells = 8,
      w = this.__width / hcells,
      h = this.__height / vcells,
      gridpoints = [];

  for (x = 0; x < hcells; x++) {
    for (y = 0; y < vcells; y++) {
      if (x > 0 && y > 0) {
        gridpoints.push([x * w, y * h]);
      }
      this.__ctx.strokeRect(x * w, y * h, w, h);
    }
  }

  // register a click handler that will
  // place a note on the grid at the closest point
  // to the click
  self.__canvas.addEventListener('mousedown', function(event) {
    var pos = mousePos(event);
  });
};

Lightning.Sequencer.prototype.on = function(type, handler) {
  var self = this;
  if (typeof type !== 'string' || !(type in self.__events)) {
    throw new TypeError('invalid type: ' + type);
  }
  this.__events[type](handler);
};

Lightning.Sequencer.create = function(options) {
  return new Lightning.Sequencer(options);
};
