module.exports = {
  use: use,
  model: model,
  swagger: swagger
};

var _ = require('lodash');
var util = require('util');
var router = require("./express/router.js");
var ajv = require('ajv')({allErrors: true});

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
    console.error(ajv.errors);
    console.error(util.inspect(meta, {depth:null, colors: true}));
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

  meta.dump = function() {
    var obj = {};
    var self = this;
    Object.keys(this).forEach(function(k) {
      if (k[0] != '$') {
        obj[k] = self[k];
      }
    });

    return obj;
  };

  console.error(util.inspect(meta.dump(), {depth: null, colors: true}));
  meta.$router = router(meta);


  return meta;
}
// https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/yaml/petstore-expanded.yaml
function swagger(cfg) {
/*
  {
    "title": "Swagger Sample App",
    "description": "This is a sample server Petstore server.",
    "termsOfService": "http://swagger.io/terms/",
    "contact": {
      "name": "API Support",
      "url": "http://www.swagger.io/support",
      "email": "support@swagger.io"
    },
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    },
  }
    "version": "0.0.1",

  cfg.basePath = ["/api"];
  cfg.schemes = ["http"];
  cfg.consumes = [
    // uploads
    "application/x-www-form-urlencoded",
    // default
    "application/json"
  ];

  cfg.produces = [
    "application/json",
    "application/xml"
  ];

  cfg.paths = {};
*/
}
