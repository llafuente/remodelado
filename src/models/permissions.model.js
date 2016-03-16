'use strict';

var permissions_json = require('./permissions.model.json');

module.exports = function(modelador) {
  var permissions = modelador.model(permissions_json);
  permissions.init();

  return permissions;
};
