Lightning.Sequencer = function(options) {
  options = options || {};

  /**
   * @class Cell
   */
  function Cell(ctx, x, y, w, h) {
    this.__on = false;
    this.__x = x; this.__y = y;
    this.__w = w; this.__h = h;
    this.__ctx = ctx;
  }

  Cell.prototype.x =  function() { return this.__x;  };
  Cell.prototype.y =  function() { return this.__y;  };

  Cell.prototype.toString = function() {
    return '(' + this.__x + ', ' + this.__y + ')';
  };

  /**
   * Determine if (x, y) is in this cell.
   */
  Cell.prototype.contains = function(x, y) {
    return x > this.__x && x < this.__x + this.__w
      &&   y > this.__y && y < this.__y + this.__h;
  };

  /**
   * Toggle the cell on/off.
   */
  Cell.prototype.toggle = function() {
    this.__on = !this.__on;
    if (this.__on) {
      this.__ctx.strokeStyle = '#000000';
      this.__ctx.fillStyle = '#000000';
      this.__draw();
    } else {
      this.__ctx.strokeStyle = '#FFFFFF';
      this.__ctx.fillStyle = '#FFFFFF';
      this.__draw();
    }
  };

  /**
   * Draw the cell.
   */
  Cell.prototype.__draw = function() {
    this.__ctx.fillRect(this.__x + (this.__w * 0.25),
                        this.__y + (this.__h * 0.25),
                        this.__w / 2,
                        this.__h / 2);
  };

  Cell.create = function(x, y, w, h) {
    return new Cell(x, y, w, h);
  };

  // initialize sequencer

  var self = this,
      elid = options.id;

  self.__canvas = document.getElementById(elid);
  self.__w = self.__canvas.width;
  self.__h = self.__canvas.height;
  self.__ctx = self.__canvas.getContext('2d');
  self.__boundary = self.__canvas.getBoundingClientRect();

  var mousePos = function(event) {
    return {
      x: event.clientX - self.__boundary.left,
      y: event.clientY - self.__boundary.top
    };
  };

  self.__hcells = 64;
  self.__vcells = 16;

  var x,
      y,
      w = self.__w / self.__hcells,
      h = self.__h / self.__vcells;

  self.__cells = [];

  for (x = 0; x < self.__hcells; x++) {
    for (y = 0; y < self.__vcells; y++) {
      // draw grid
      self.__ctx.strokeRect(x * w, y * h, w, h);
      // create cells
      self.__cells[x] = self.__cells[x] || [];
      self.__cells[x].push(Cell.create(self.__ctx, x * w, y * h, w, h));
    }
  }

  // register a click handler that will
  // place a note on the grid at the closest point
  // to the click
  self.__canvas.addEventListener('mousedown', function(event) {
    var cell,
        pos = mousePos(event);

    for (x = 0; x < self.__hcells; x++) {
      for (y = 0; y < self.__vcells; y++) {
        cell = self.__cells[x][y];
        console.log('testing cell ' + cell);
        if (cell.contains(pos.x, pos.y)) {
          console.log('clicked cell ' + cell);
          cell.toggle();
          return;
        }
      }
    }
  });
}; // Lightning.Sequencer constructor

Lightning.Sequencer.create = function(options) {
  return new Lightning.Sequencer(options);
};
