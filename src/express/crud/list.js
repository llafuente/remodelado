'use strict';

module.exports = list_middleware;
module.exports.list = list;
module.exports.list_query = list_query;

var mongoose = require('mongoose');
var ValidationError = mongoose.Error.ValidationError;

var exutils = require('../utils.js');

function list_query(meta, logger, where, sort, limit, offset, populate, error, ok) {
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
      return error(400, err);
    }
  } else if ('object' === typeof where) {
    where = where;
  } else {
    where = {};
  }
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
    return error(400, err);
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
    return error(400, err);
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
      return error(400, err);
    }

    if (options.options.restricted) {
      err = new ValidationError(null);
      err.errors.sort = {
        path: 'query:sort',
        message: 'field is restricted',
        type: 'invalid-sort',
        value: path,
        value_type: 'string',
      };
      return error(400, err);
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
    return error(400, err);
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
      return error(400, err);
    }

    if (!exutils.type_can_be_populated(options.options.type)) {
      err = new ValidationError(null);
      err.errors.populate = {
        path: 'query:populate',
        message: 'field cannot be populated',
        type: 'invalid-populate',
        value: path,
      };
      return error(400, err);
    }

    if (options.options.restricted) {
      err = new ValidationError(null);
      err.errors.populate = {
        path: 'query:populate',
        message: 'field is restricted',
        type: 'invalid-populate',
        value: path,
      };
      return error(400, err);
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
      return error(400, err);
    }
    query = query.where(path).equals(where[path]);
    qcount = qcount.where(path).equals(where[path]);
  }

  return ok(query, qcount, limit, offset);
}

function list(meta, logger, where, sort, limit, offset, populate, error, ok) {
  list_query(
    meta,
    logger,
    where,
    sort,
    limit,
    offset,
    populate,
    error,
    function build_query_ok(query, qcount, limit, offset) {
      query.exec(function(err, mlist) {
        /* istanbul ignore next */ if (err) {
          return error(500, err);
        }

        qcount.exec(function(err, count) {
          /* istanbul ignore next */ if (err) {
            return error(500, err);
          }

          return ok(count, offset, limit, mlist);
        });
      });
    }
  );
}

function list_middleware(meta) {
  return function(req, res/*, next*/) {
    return list(
      meta,
      req.log,

      req.query.where,
      req.query.sort,
      req.query.limit,
      req.query.offset,
      req.query.populate,

      res.error,
      function list_queries_exec_ok(count, offset, limit, mlist) {
        function mnext() {
          var list = mlist.map(function(d) { return d.toJSON(); });

          meta.$express.before_send(req, 'list', list, function(err, output_list) {
            /* istanbul ignore next */ if (err) {
              return res.error(err);
            }

            res.status(200).json({
              count: count,
              offset: offset,
              limit: limit,
              list: output_list
            });
          });
        }

        // TODO
        //if (opts.after_fetch) {
        //  return opts.after_fetch(mlist, req, res, mnext);
        //}

        mnext();
      }
    );
  };
}
