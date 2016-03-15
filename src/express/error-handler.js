'use strict';

module.exports = error_handler;
module.exports.middleware = middleware;

var mongoose = require('mongoose');
var ValidationError = mongoose.Error.ValidationError;
var CastError = mongoose.Error.CastError;
var _ = require('lodash');
var forEach = _.forEach;
var clone = _.clone;
var domain = require('domain');

function mongoose_to_readable(schema, err, path) {
  var value = clone(err);

  if ('CastError' === value.name) {
    value.type = 'invalid-type';
    value.message = 'cast-failed';
    value.value_constraint = 'cast';
  } else if ('ValidatorError' === value.name) {
    value.type = 'invalid-value';
    value.value_type = null; // ??
    value.value_constraint = value.properties.kind || value.properties.type;
    delete value.properties;
  }
  var options = schema.path(path);
  if (options && options.options) {
    // remove empty labels
    if (options.options.label) {
      value.label = options.options.label;
    }

    if ('function' === typeof options.options.type) {
      value.value_type = options.options.type.name.toLowerCase();
    } else {
      value.value_type = options.options.type;
    }
  } else {
    value.value_type = value.value_type === undefined ? null : value.value_type;
  }

  delete value.name;
  delete value.kind;
  //not necessary, redundant
  delete value.properties;

  return value;
}

function error_handler(err, req, res, schema) {
  req.log.info(err);

  if (Array.isArray(err)) {
    return res.status(500).json({
      error: err.map(function(e) {
        return e.message;
      })
    });
  }

  if (err instanceof CastError) {
    req.log.silly('CastError');
    return res.status(400).json({
      error: mongoose_to_readable(schema, err, err.path)
    });
  } else if (err instanceof ValidationError) {
    req.log.silly('ValidationError');
    // cleanup error
    var errors = [];
    forEach(err.errors, function(err, path) {
      errors.push(mongoose_to_readable(schema, err, path));
    });

    return res.status(400).json({error: errors});
  }

  if (err.status) {
    req.log.silly('StatusedError: ' +  err.message);
    return res.status(err.status).json({
      error: err.message,
      trace: err.stack
    });
  }

  req.log.silly('Exception');
  return res.status(500).json({error: err.message});
}

function middleware(meta) {
  return function(req, res, next) {
    res.error = function(err, message) {
      if (arguments.length === 2) {
        if (message instanceof Error) {
          message.status = err;
          return error_handler(message, req, res, meta.$schema);
        }
        err = {status: err, message: message};
      }

      return error_handler(err, req, res, meta.$schema);
    };

    var d = domain.create();
    d.on('error', function(err) {
      req.log.silly('(domain error)');
      err.status = 500;
      return error_handler(err, req, res, meta.$schema);
    });

    d.run(function() {
      next();
    });
  };
}
