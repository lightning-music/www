
var Lightning = Lightning || {};

/**
 * @class Note
 */
Lightning.Note = function(x, y, r) {
  this.__on = false;
  this.__x = x; this.__y = y;
  this.__r = r;
};

Lightning.Note.prototype.x =  function() { return this.__x;  };
Lightning.Note.prototype.y =  function() { return this.__y;  };

Lightning.Note.prototype.toString = function() {
  return '(' + this.__x + ', ' + this.__y + ', ' + this.__r + ')';
};

/**
 * Determine if (x, y) is in this cell.
 */
Lightning.Note.prototype.contains = function(x, y) {
  return this.__r > Math.sqrt(Math.pow(this.__x - x, 2) +
                              Math.pow(this.__y - y, 2));
};

/**
 * Toggle the cell on/off.
 */
Lightning.Note.prototype.toggle = function() {
  this.__on = !this.__on;
};

/**
 * Draw the note on a 2d context.
 */
Lightning.Note.prototype.draw = function(ctx) {
  ctx.fillStyle = 'black';
  ctx.drawArc(this.__x, this.__y, this.__r, 0, 2 * Math.PI, false);
};

Lightning.Note.create = function(x, y, w, h) {
  return new Lightning.Note(x, y, w, h);
};

/**
 * @class Sequencer
 */
Lightning.Sequencer = function(canvas, context, options) {
  options = options || {};

  // initialize sequencer

  var self = this;

  self.__w = canvas.width;
  self.__h = canvas.height;

  self.__hcells = 64;
  self.__vcells = 16;

  var x,
      y,
      w = self.__w / self.__hcells,
      h = self.__h / self.__vcells;

  self.__cells = [];

  for (x = 0; x < self.__hcells; x++) {
    for (y = 0; y < self.__vcells; y++) {
      // create cells
      self.__cells[x] = self.__cells[x] || [];
      self.__cells[x].push(Lightning.Note.create(x * w, y * h, w / 2));
    }
  }
};

Lightning.Sequencer.prototype.click = function(pos) {
  var self = this,
      note, x, y;

  for (x = 0; x < self.__hcells; x++) {
    for (y = 0; y < self.__vcells; y++) {
      note = self.__cells[x][y];

      if (note.contains(pos.x, pos.y)) {
        console.log('clicked', note);
        note.toggle();
        return;
      }
    }
  }
};

Lightning.Sequencer.draw = function(ctx) {
};

Lightning.Sequencer.create = function(options) {
  return new Lightning.Sequencer(options);
};
