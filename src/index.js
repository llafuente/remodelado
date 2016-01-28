module.exports = {
  use: use,
  model: model
};

var _ = require('lodash');
var urls = require("./express/urls.js");
var router = require("./express/router.js");
var express = require("./express/express.js");

var mongoose = null;
var timestamps = require('mongoose-timestamp');

var default_schema = require('./schema/default.js');
var angular_schema = require('./schema/angular.js');
var schema_mongoose = require('./schema/mongoose.js');

function use(_mongoose) {
  mongoose = _mongoose;
}

function model(json) {
  // always have the full metadata available
  default_schema(json);
  var angular = angular_schema(json);
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

  urls(mdl);

  mdl.router = router(mdl);

  mdl.model = mongoose.model(json.name, mdl.schema);

  return mdl;
}
