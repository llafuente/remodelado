var remodelado = require("../../src/index.js");
var roles_json = require("./roles.model.json");

module.exports = function(app) {
  var roles = remodelado.model(roles_json);
  roles.init();
  app.use(roles.$router);
}
