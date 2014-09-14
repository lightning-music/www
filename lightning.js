var EventEmitter = require('events').EventEmitter,
    http = require('http'),
    util = require('util'),
    $ = require('jquery'),
    Backbone = require('backbone'),
    Samples = require('./samples');

// HACK
// see https://github.com/marionettejs/backbone.marionette/issues/1719
// and https://github.com/jashkenas/backbone/issues/3291
Backbone.$ = $;

var Marionette = require('backbone.marionette');

function Lightning(options) {
  var self = this;
  options = options || {};
  self._hostname = options.hostname || 'localhost';
  self._port = options.port || 3428;

  var App = Marionette.Application.extend({
    initialize: function(options) {
      console.log('app initialized');
    }
  });

  // initialize universe
  self._app = new App({ conatiner: '#app' });
  self._samples = Samples.create();
  // websocket endpoint for triggering samples
  var psuri = 'ws://' + self._hostname + ':' + self._port + '/sample/play';
  // TODO: support node
  var playSamples = new WebSocket(psuri);
  playSamples.onopen = function(event) {
    console.log('connected to ' + psuri);
    self._app.start(self._app);
  };
}

util.inherits(Lightning, EventEmitter);

/**
 * Get the list of samples the server can play.
 */
Lightning.prototype.listSamples = function(cb) {
  this._samples.FetchList(cb);
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
