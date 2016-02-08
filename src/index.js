module.exports = {
  use: use,
  model: model
};

var _ = require('lodash');
var router = require("./express/router.js");

var mongoose = null;
var timestamps = require('mongoose-timestamp');

var schema_default = require('./schema/default.js');
var schema_angular = require('./schema/angular.js');
var schema_mongoose = require('./schema/mongoose.js');
var schema_express = require('./schema/express.js');

function use(_mongoose) {
  mongoose = _mongoose;
}

function model(meta) {
  // always have the full metadata available
  schema_default(meta);
  schema_angular(meta);
  schema_mongoose(meta);

  meta.$schema = new mongoose.Schema(meta.schema, meta.mongoose);
  meta.$schema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  meta.$model = mongoose.model(meta.name, meta.$schema);

  schema_express(meta);
  meta.$router = router(meta);

  return meta;
}
