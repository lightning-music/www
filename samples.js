var http = require('http'),
    funcUtils = require('./func-utils'),
    $ = require('jquery'),
    Backbone = require('backbone');

Backbone.$ = $;
var Marionette = require('backbone.marionette');

function Samples(options) {
  var self = this;
  // http options
  options = options || {};
  self._hostname = options.hostname || 'localhost';
  self._port = options.port || 3428;
  // initialize templates
  self._triggerTemplate = require('./sample-trigger');
  // initialize region
  self._region = Marionette.Region.extend({
    el: '#sample-triggers'
  });
}

Samples.prototype.Region = function() {
  return this._region;
};

Samples.prototype.FetchList = function(cb) {
  var self = this,
      callback = funcUtils.callOnce(cb);

  var opts = {
    hostname: self._hostname,
    port: self._port,
    method: 'GET',
    path: '/samples'
  };

  var respond = function(res) {
    res.on('data', function(data) {
      var samples;
      try {
        samples = JSON.parse(data);
      } catch (e) {
        cb(e);
        return;
      }
      
      var buttons = samples.map(function(samp) {
        return self._triggerTemplate({ path: samp });
      });

      $('#sample-triggers').html(buttons.join("\n"));
    });
  };

  var req = http.request(opts, respond);

  req.on('error', function(err) {
    callback(null, err);
  });

  req.end();
};

module.exports.create = function(options) {
  return new Samples(options);
};
