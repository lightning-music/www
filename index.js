var $ = require('jquery'),
    Lightning = require('./lightning');

$(function() {
  var lightning = Lightning.create();
  lightning.listSamples(function(err, samples) {
    if (err) {
      console.error(err);
      return;
    }
  });
});
