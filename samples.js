var Marionette = require('backbone.marionette');

function Samples() {
  var self = this;

  self.Selectors = Marionette.Region.extend({
    el: '#sample-triggers'
  });
}

module.exports.create = function() {
  return new Samples();
};
