'use strict';

module.exports = Modelador;

var util = require('util');
var mongoose = require('mongoose');
var router = require('./express/router.js');
var ajv = require('ajv')({allErrors: true});

var schema = require('./schema/schema.json');
var schema_default = require('./schema/default.js');
var schema_angular = require('./schema/angular.js');
var schema_mongoose = require('./schema/mongoose.js');
var schema_express = require('./schema/express.js');

var express = require('express');

//
// configure mongoose errors
//

var messages = mongoose.Error.messages;

// TODO access model.errors and override this default values!
messages.general.default = 'err-validator-failed';
messages.general.required = 'err-required';
messages.Number.min = 'err-min';
messages.Number.max = 'err-max';
messages.Date.min = 'err-min';
messages.Date.max = 'err-max';
messages.String.enum = 'err-out-of-bounds';
messages.String.match = 'err-match';
messages.String.minlength = 'err-minlength';
messages.String.maxlength = 'err-maxlength';

function Modelador(config, _mongoose) {
  this.mongoose = _mongoose;
  this.permissions = [];
  this.models = {};
  this.model = model;
  this.swagger = swagger;

  var permissions = require('./models/permissions.model.js')(this);
  var user = require('./models/user.model.js')(this, config);
  var roles = require('./models/roles.model.js')(this);

  permissions.init();
  user.init();
  roles.init();


  this.$router = express.Router();

  this.$router.use(user.$router);
  this.$router.use(permissions.$router);
  this.$router.use(roles.$router);
}

function model(meta) {
  // validate
  var valid = ajv.validate(schema, meta);
  if (!valid) {
    console.error(ajv.errors);
    console.error(util.inspect(meta, {depth:null, colors: true}));
    throw new Error('invalid schema');
  }

  // always have the full metadata available
  schema_default(meta);
  schema_mongoose(meta, this.mongoose, this.models);
  schema_angular(meta);

  schema_express(meta);

  meta.dump = function() {
    var obj = {};
    var self = this;
    Object.keys(this).forEach(function(k) {
      if ('$' !== k[0]) {
        obj[k] = self[k];
      }
    });

    return obj;
  };

  //console.error(util.inspect(meta.dump(), {depth: null, colors: true}));
  meta.$router = router(meta);

  this.models[meta.singular] = meta;
  this.models[meta.plural] = meta;

  return meta;
}
// https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/yaml/petstore-expanded.yaml
function swagger(/*cfg*/) {
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
