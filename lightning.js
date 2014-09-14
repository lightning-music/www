var EventEmitter = require('events').EventEmitter,
    http = require('http'),
    util = require('util');

function Lightning(options) {
  var self = this;
  options = options || {};
  self._hostname = options.hostname || 'localhost';
  self._port = options.port || 3428;
}

util.inherits(Lightning, EventEmitter);

/**
 * Get the list of samples the server can play.
 */
Lightning.prototype.listSamples = function(cb) {
  var opts = {
    hostname: this._hostname,
    port: this._port,
    method: 'GET',
    path: '/samples'
  };

  var req = http.request(opts, function(res) {
    res.on('data', function(data) {
      cb(null, JSON.parse(data));
    });
  });

  req.on('error', function(err) {
    cb(null, err);
  });

  req.end();
};

/**
 * Create a new instance of Lightning
 * 
 * @param  {Object}    options
 * @param  {String}    options.hostname - Name of lightning host
 * @param  {String}    options.port - Listening port of lightning host
 */
module.exports.create = function(options) {
  return new Lightning(options);
};
