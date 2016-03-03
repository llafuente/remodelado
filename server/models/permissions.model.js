var remodelado = require("../../src/index.js");
var permissions_json = require("./permissions.model.json");

module.exports = function(app) {
  var permissions = remodelado.model(permissions_json);
  permissions.init();
  app.use(permissions.$router);
}
