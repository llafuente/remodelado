'use strict';

module.exports = Modelador;

var util = require('util');
var router = require('./express/router.js');
var ajv = require('ajv')({allErrors: true});

var schema = require('./schema/schema.json');
var schema_default = require('./schema/default.js');
var schema_angular = require('./schema/angular.js');
var schema_mongoose = require('./schema/mongoose.js');
var schema_express = require('./schema/express.js');

var jwt = require('express-jwt/node_modules/jsonwebtoken');
var ex_jwt = require('express-jwt');
var express = require('express');
var error_handler = require('./express/error-handler.js');

function Modelador(config, _mongoose) {
  this.mongoose = _mongoose;
  this.permissions = [];
  this.models = {};
  this.model = model;
  this.swagger = swagger;

  var permissions = require('./models/permissions.model.js')(this);
  var user = require('./models/user.model.js')(this);
  var roles = require('./models/roles.model.js')(this);


  this.$router = express.Router();

  //
  // jwt
  //
  this.$router.use(ex_jwt({
    secret: config.auth.secret,
    credentialsRequired: false,
    getToken: function from_header_or_querystring(req) {
      if (req.headers.authorization) {
        var x = req.headers.authorization.split(' ');
        if (x[0] === 'Bearer') {
          return x[1];
        }
      } else if (req.query && req.query.access_token) {
        return req.query.access_token;
      }
      return null;
    }
  }));

  // error-handler
  this.$router.use(error_handler.middleware({}));

  this.$router.use(function(req, res, next) {
    if (req.user && req.user.id) {
      req.log.silly("regenerate session" + req.user.id.toString());

      return api.models.user.$model
      .findOne({
        _id: req.user.id
      })
      .populate("roles")
      .exec(function(err, dbuser) {
        if (err || !dbuser) {
          return res.error(401, 'Regenerate session failed');
        }

        req.user = dbuser;
        req.log.silly("user logged: " + JSON.stringify(dbuser.toJSON()));
        next();

      });
    }
    next();
  });

  this.$router.use(permissions.$router);
  this.$router.use(user.$router);
  this.$router.use(roles.$router);

  var api = this;
  //
  // TODO properly handle user-login, regenerate session(/me).
  //
  this.$router.post('/users/me', function(req, res/*, next*/) {
    // TODO check token
    if (!req.headers.authorization) {
      return res.status(401).json({error: 'No session'});
    }

    if (!req.user) {
      return res.status(401).json({error: 'Invalid session'});
    }

    // TODO handle permissions
    var u = req.user.toJSON();
    u.id = u._id;
    res.status(200).json(u);
  });

  this.$router.post('/auth', function(req, res/*, next*/) {

    api.models.user.$model.findOne({
      username: req.body.username
    }, function(err, user) {
      // TODO res.error doesn't exist!
      if (err) {
        return res.error(err);
      }

      if (!user || !user.authenticate(req.body.password)) {
        return res.error(422, 'User not found or invalid pasword');
      }
      // TODO do not save the entire user, just _id
      // TODO load from the _id the user
      res.status(200).json({
        'token': jwt.sign({
          id: user._id.toString(),
          session_start: (new Date()).toString()
        }, config.auth.secret)
      });
    });
  });
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
