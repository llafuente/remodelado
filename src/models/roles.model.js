var roles_json = require("./roles.model.json");

module.exports = function(modelador) {
  var roles = modelador.model(roles_json);
  roles.init();

  return roles;
}
