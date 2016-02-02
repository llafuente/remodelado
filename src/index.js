module.exports = {
  use: use,
  model: model
};

var _ = require('lodash');
var router = require("./express/router.js");
var express = require("./express/express.js");

var mongoose = null;
var timestamps = require('mongoose-timestamp');

var schema_default = require('./schema/default.js');
var schema_angular = require('./schema/angular.js');
var schema_mongoose = require('./schema/mongoose.js');
var schema_express = require('./schema/express.js');

function use(_mongoose) {
  mongoose = _mongoose;
}

function model(json) {
  // always have the full metadata available
  schema_default(json);
  schema_angular(json);
  schema_express(json);
  var schema = schema_mongoose(json);

  var mdl = {
    json: json,
    name: json.name,
    schema: new mongoose.Schema(schema, json.mongoose)
  };

  express(mdl);

  mdl.schema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  mdl.router = router(mdl);

  mdl.model = mongoose.model(json.name, mdl.schema);

  return mdl;
}
