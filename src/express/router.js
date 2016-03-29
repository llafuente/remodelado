'use strict';

module.exports = router;

var express = require('express');
var error_handler = require('./error-handler.js');

var read = require('./crud/read.js');
var list = require('./crud/list.js');
var create = require('./crud/create.js');
var update = require('./crud/update.js');
var destroy = require('./crud/destroy.js');
var show = require('./crud/show.js');
var format = require('./crud/format.js');
var angular = require('./angular.js');
var auth = require('./authorization.js');

function router(meta) {
  var r = express.Router();

  // api

  if (meta.backend.permissions.list) {
    r.get(meta.$express.urls.list, [
      auth.authorization(),
      auth.has_permission(meta.$express.permissions.list),
      list(meta, 'entities'),
      format(meta, 'entities', 'entities'),
      show(meta, 200, 'entities')
    ]);
    r.get(meta.$angular.templates.list, angular.list_tpl(meta));
    r.get(meta.$angular.controllers.list, angular.list_ctrl(meta));
  }

  if (meta.backend.permissions.read) {
    r.get(meta.$express.urls.read, [
      auth.authorization(),
      auth.has_permission(meta.$express.permissions.read),
      read(meta, 'entity'),
      format(meta, 'entity', 'entity'),
      show(meta, 200, 'entity')
    ]);
  }

  if (meta.backend.permissions.create) {
    r.post(meta.$express.urls.create, [
      auth.authorization(),
      auth.has_permission(meta.$express.permissions.create),
      create(meta, 'entity'),
      format(meta, 'entity', 'entity'),
      show(meta, 201, 'entity')
    ]);
    r.get(meta.$angular.controllers.create, angular.create_ctrl(meta));
    r.get(meta.$angular.templates.create, function(req, res, next) {
      req.query.action = 'create';
      next();
    }, angular.forms(meta));
  }

  if (meta.backend.permissions.update) {
    if (!meta.backend.permissions.read) {
      throw new Error(`${meta.singular} invalid permissions: update require read`);
    }

    r.patch(meta.$express.urls.update, [
      auth.authorization(),
      auth.has_permission(meta.$express.permissions.update),
      read(meta, 'entity'),
      update(meta, 'entity', 'entity'),
      format(meta, 'entity', 'entity'),
      show(meta, 200, 'entity')
    ]);
    r.get(meta.$angular.controllers.update, angular.update_ctrl(meta));
    r.get(meta.$angular.templates.update, function(req, res, next) {
      req.query.action = 'update';
      next();
    }, angular.forms(meta));
  }

  if (meta.backend.permissions.delete) {
    r.delete(meta.$express.urls.delete, [
      auth.authorization(),
      auth.has_permission(meta.$express.permissions.delete),
      destroy(meta),
      show(meta, 204)
    ]);
  }

  // angular
  r.get(meta.$angular.configuration, angular.configuration(meta));

  // error-handler
  r.use(function(err, req, res, next) {
    return error_handler(err, req, res, meta.$schema, next);
  });

  return r;
}
