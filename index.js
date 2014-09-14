var Lightning = require('./lightning'),
    lightning = Lightning.create(),
    $ = require('jquery'),
    Backbone = require('backbone');

// HACK
// see https://github.com/marionettejs/backbone.marionette/issues/1719
// and https://github.com/jashkenas/backbone/issues/3291
Backbone.$ = $;

var Marionette = require('backbone.marionette'),
    App = Marionette.Application.extend({
      initialize: function(options) {
        console.log(options.container);
      }
    });

// initialize universe
var app = new App({ conatiner: '#app' });

var td = './templates';
var templates = {
  sample: {
    trigger: require(td + '/sample-trigger')
  }
};

console.log(typeof templates.sample.trigger);
console.log();

lightning.listSamples(function(err, samples) {
  if (err) {
    console.error(err);
    return;
  }
  
  var buttons = samples.map(function(samp) {
    return templates.sample.trigger({ path: samp });
  });

  $('#sample-triggers').html(buttons.join("\n"));
});
