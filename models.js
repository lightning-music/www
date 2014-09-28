Lightning.Models = {};
Lightning.Collections = {};

Lightning.Models.SampleTrigger = Backbone.Model.extend({
});

Lightning.Collections.SampleTriggers = Backbone.Collection.extend({
  model: Lightning.Models.SampleTrigger,
  url: 'http://localhost:3428/samples'
});
