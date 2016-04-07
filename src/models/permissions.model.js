'use strict';

var permissions_json = require('js-yaml').load(require('fs')
  .readFileSync(`${__dirname}/permissions.model.yml`, 'utf8'));

module.exports = function(modelador) {
  var permissions = modelador.model(permissions_json);

  return permissions;
};
