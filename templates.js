function GenerateTemplate(id) {
  if (id.charAt(0) !== '#') {
    id = '#' + id;
  }
  return function(data) {
    return _.template($(id).html().trim(), data);
  };
}

Lightning.Templates = {
  'sample:trigger' : GenerateTemplate('sample-trigger-template')
};

