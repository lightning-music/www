Lightning.Views = Lightning.Views || {};

Lightning.Views.SampleTriggers = Backbone.View.extend({
  collection: Lightning.Models.SampleTriggers,

  template: Lightning.Templates['sample:trigger'],

  events: {
    'click .sample-trigger': 'playSample'
  },

  initialize: function(samples) {
    var self = this;
    self.collection = new Lightning.Collections.SampleTriggers(samples);
    self.collection.on('reset', function() {
      self.render();
    });
    self.collection.fetch({ reset: true });
  },

  playSample: function(event) {
    var sample = event.target.id;
    lightning.playSample(sample, 60, 96);
    event.preventDefault();
    event.stopPropagation();
  },

  render: function() {
    var self = this;
    self.collection.each(function(model) {
      var html = self.template(model.attributes);
      self.$el.append(html);
    });
    return this;
  }
});

Lightning.Views.Transport = Backbone.View.extend({
  template: Lightning.Templates['transport'],

  events: {
    'click #transport-start': 'start',
    'click #transport-stop': 'stop'
  },

  initialize: function(options) {
    console.log('transport.initialize');
  },

  render: function() {
    var html = this.template();
    this.$el.html(html);
    console.log('rendering', html);
    return this;
  },

  start: function() {
  },

  stop: function() {
  }
});
