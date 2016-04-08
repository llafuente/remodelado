'use strict';

module.exports = list_middleware;
module.exports.list_query = list_query;

var mongoose = require('mongoose');
var ValidationError = mongoose.Error.ValidationError;
var csv_writer = require('csv-write-stream');
var jsontoxml = require('jsontoxml');
var exutils = require('../utils.js');
var Pagination = require('./pagination.js');
var schema_utils = require('../../schema/utils.js');


function list_query(meta, logger, user, where, sort, limit, offset, populate, next) {
  var query = meta.$model.find({});
  var qcount = (query.toConstructor())().count();
  var path;
  var options;

  // some of theese can be meta.options.xxx
  if ('string' === typeof where) {
    try {
      where = JSON.parse(where);
    } catch (_) {
      err = new ValidationError(null);
      err.errors.offset = {
        path: 'query:where',
        message: 'invalid where',
        type: 'invalid-where',
        value: where,
        value_type: 'json_string',
      };
      return next(err);
    }
  } else if ('object' === typeof where) {
    where = where;
  } else {
    where = {};
  }

  // TODO HACK review this '$' -> '.'
  Object.keys(where).forEach(function(k) {
    if (k.indexOf('$') !== -1) {
      where[k.replace(/\$/g, '.')] = where[k];
      delete where[k];
    }
  });
  $log.debug(where);

  sort = sort || '_id';
  limit = limit ? parseInt(limit, 10) : 0;
  offset = offset ? parseInt(offset, 10) : 0;
  populate = populate || [];
  var err;

  if (isNaN(offset)) {
    err = new ValidationError(null);
    err.errors.offset = {
      path: 'query:offset',
      message: 'offset must be a number',
      type: 'invalid-offset',
      value: offset,
      value_type: 'number',
    };
    return next(err);
  }

  if (offset) {
    query.skip(offset);
  }

  if (isNaN(limit)) {
    err = new ValidationError(null);
    err.errors.limit = {
      path: 'query:limit',
      message: 'limit must be a number',
      type: 'invalid-limit',
      value: limit,
      value_type: 'number',
    };
    return next(err);
  }


  if (limit) {
    query.limit(limit);
  }
  // http://mongoosejs.com/docs/api.html#query_Query-sort
  // validate sort
  var ss = sort.split(' ');
  var i;
  for (i = 0; i < ss.length; ++i) {
    path = ss[i][0] === '-' ? ss[i].substring(1) : ss[i];
    options = meta.$schema.path(path);
    if (!options) {
      err = new ValidationError(null);
      err.errors.sort = {
        path: 'query:sort',
        message: 'not found in schema',
        type: 'invalid-sort',
        value: path,
        value_type: 'string',
      };
      return next(err);
    }

    if (schema_utils.is_path_restricted(meta, path, 'read', user)) {
      err = new ValidationError(null);
      err.errors.sort = {
        path: 'query:sort',
        message: 'field is restricted',
        type: 'invalid-sort',
        value: path,
        value_type: 'string',
      };
      return next(err);
    }
  }

  query.sort(sort);

  // populate
  if (!Array.isArray(populate)) {
    err = new ValidationError(null);
    err.errors.populate = {
      path: 'query:populate',
      message: 'is not an array',
      type: 'invalid-populate',
      value: populate,
    };
    return next(err);
  }

  for (i = 0; i < populate.length; ++i) {
    path = populate[i];
    options = meta.$schema.path(path);
    if (!options) {
      err = new ValidationError(null);
      err.errors.populate = {
        path: 'query:populate',
        message: 'not found in schema',
        type: 'invalid-populate',
        value: path,
      };
      return next(err);
    }

    if (!exutils.type_can_be_populated(options.options.type)) {
      err = new ValidationError(null);
      err.errors.populate = {
        path: 'query:populate',
        message: 'field cannot be populated',
        type: 'invalid-populate',
        value: path,
      };
      return next(err);
    }

    if (schema_utils.is_path_restricted(meta, path, 'read', user)) {
      err = new ValidationError(null);
      err.errors.populate = {
        path: 'query:populate',
        message: 'field is restricted',
        type: 'invalid-populate',
        value: path,
      };
      return next(err);
    }

    query.populate(path);
  }

  // where
  for (path in where) {
    options = meta.$schema.path(path);
    if (!options) {
      err = new ValidationError(null);
      err.errors.populate = {
        path: 'query:where',
        message: 'not found in schema',
        type: 'invalid-where',
        value: path,
      };
      return next(err);
    }
    query = query.where(path).equals(where[path]);
    qcount = qcount.where(path).equals(where[path]);
  }

  return next(null, query, qcount, limit, offset);
}

function list_query_builder_middleware(meta) {
  return function(req, res, next) {
    req.log.silly('list_query_builder_middleware');
    list_query(
      meta,
      req.log,
      req.user,

      req.query.where,
      req.query.sort,
      req.query.limit,
      req.query.offset,
      req.query.populate,

      function build_query_ok(err, query, qcount, limit, offset) {
        if (err) {
          return next(err);
        }

        req.log.silly('build_query_ok');
        req.list = {
          query: query,
          qcount: qcount,
          limit: limit,
          offset: offset,
        };
        next();
      }
    );
  };
}

function json_list_query_middleware(meta, store_at) {
  return function(req, res, next) {
    req.log.silly('json_list_query_middleware');
    req.list.query.exec(function(err, mlist) {
      /* istanbul ignore next */ if (err) {
        return next(err);
      }

      req.list.qcount.exec(function(err, count) {
        /* istanbul ignore next */ if (err) {
          return next(err);
        }

        req[store_at] = new Pagination(count, req.list.offset, req.list.limit, mlist);
        return next();
      });
    });
  };
}
// TODO labels
function csv_list_query_middleware(meta) {
  return function(req, res, next) {
    req.log.silly('Headers: Accept' + req.headers.accept);
    //example: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
    if (req.headers.accept && req.headers.accept.indexOf('text/csv') !== -1) {
      res.set('content-type', 'text/csv; charset=utf-8');
      // TODO doc: strict means exactly current page!
      if (!req.query.strict) {
        req.list.query.limit(0);
        req.list.query.skip(0);
      }
      req.list.query.lean(true);

      var newline = '\n';
      switch (req.query.newline) {
      case 'win': newline = '\r\n'; break;
      case 'linux': newline = '\n'; break;
      case 'max': newline = '\r'; break;
      }

      var writer = csv_writer({
        sendHeaders: true,
        separator: req.query.separator || ',',
        newline: newline
      });
      writer.pipe(res);

      return req.list.query
      .stream()
      .on('data', function(d) {
        meta.$express.formatter(req, d, function(err, fd) {
          writer.write(fd);
        });
      })
      .on('error', function() {
        writer.end();
      })
      .on('close', function() {
        writer.end();
      });
    }
    next();
  };
}

//TODO FIXME XML - array issues
// use: arrayMap: {nicknames: 'name'}
function xml_list_query_middleware(meta) {
  return function(req, res, next) {
    req.log.silly('xml_list_query_middleware');
    if (req.headers.accept && req.headers.accept.indexOf('text/xml') !== -1) {
      res.set('content-type', 'text/xml; charset=utf-8');
      // TODO doc: strict means exactly current page!
      if (!req.query.strict) {
        req.list.query.limit(0);
        req.list.query.skip(0);
      }
      req.list.query.lean(true);

      res.write(`<${meta.plural}>`);
      return req.list.query
      .stream()
      .on('data', function(d) {
        meta.$express.formatter(req, d, function(err, fd) {
          var obj = {};
          // properly handled id as string
          obj[meta.singular] = JSON.parse(JSON.stringify(fd));

          res.write(jsontoxml (obj, {
            escape:true,
            //xmlHeader: true,
            prettyPrint: true,
            indent: ' '
          }));

          res.write('\n');
        });
      })
      .on('error', function() {
        res.write(`</${meta.plural}>`);
        res.end();
      })
      .on('close', function() {
        res.write(`</${meta.plural}>`);
        res.end();
      });
    }
    next();
  };
}

function list_middleware(meta, store_at) {
  return  [
    list_query_builder_middleware(meta),
    csv_list_query_middleware(meta),
    xml_list_query_middleware(meta),
    json_list_query_middleware(meta, store_at),
  ];
}
