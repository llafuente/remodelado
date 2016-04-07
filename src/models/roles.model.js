'use strict';

var roles_json = require('js-yaml').load(require('fs')
  .readFileSync(`${__dirname}/roles.model.yml`, 'utf8'));

module.exports = function(modelador) {
  var roles = modelador.model(roles_json);

  return roles;
};
