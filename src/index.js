module.exports = {
  use: use,
  model: model
};

var _ = require('lodash');
var router = require("./express/router.js");
var Ajv = require('ajv');
var ajv = Ajv({allErrors: true});

var mongoose = null;
var timestamps = require('mongoose-timestamp');

var schema = require('./schema/schema.json');
var schema_default = require('./schema/default.js');
var schema_angular = require('./schema/angular.js');
var schema_mongoose = require('./schema/mongoose.js');
var schema_express = require('./schema/express.js');

function use(_mongoose) {
  mongoose = _mongoose;
}

function model(meta) {
  // validate
  var valid = ajv.validate(schema, meta);
  if (!valid) {
    console.log(ajv.errors);
    console.log(meta);
    process.exit(100);
  }

  // always have the full metadata available
  schema_default(meta);
  schema_mongoose(meta);

  meta.$schema = new mongoose.Schema(meta.backend.schema, meta.mongoose);
  meta.$schema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  meta.$model = mongoose.model(meta.singular, meta.$schema);
  schema_angular(meta);

  schema_express(meta);
  meta.$router = router(meta);

  return meta;
}
