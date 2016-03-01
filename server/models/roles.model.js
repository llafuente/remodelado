var remodelado = require("../../src/index.js");
var permissions = require("./permissions.json");
var roles_json = require("./roles.model.json");

module.exports = function(app) {
  roles_json.backend.schema.permissions.array.enum = permissions.enum;
  roles_json.backend.schema.permissions.array.labels = permissions.labels;

  var roles = remodelado.model(roles_json);
  roles.init();
  app.use(roles.$router);
}
