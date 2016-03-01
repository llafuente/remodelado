var remodelado = require("../../src/index.js");
var permissions = require("./permissions.json");
var user_json = require("./user.model.json");

module.exports = function(app) {

  user_json.backend.schema.permissions.array.enum = permissions.enum;
  user_json.backend.schema.permissions.array.labels = permissions.labels;

  var user = remodelado.model(user_json);
  user.init();
  app.use(user.$router);
}
