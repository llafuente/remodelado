"use strict";

module.exports = list_middleware;
module.exports.list = list;

var mongoose = require("mongoose");
var ValidationError = mongoose.Error.ValidationError;

var exutils = require("./utils.js");

var _ = require("lodash");
var forEach = _.forEach;

function list(mdl, where, sort, limit, offset, populate, error, ok) {
  var query = mdl.model.find({});
  var qcount = (query.toConstructor())().count();
  var path;
  var options;

  // some of theese can be mdl.options.xxx
  where = where || {};
  sort = sort || "_id";
  limit = limit ? parseInt(limit, 10) : 0;
  offset = offset ? parseInt(offset, 10) : 0;
  populate = populate || [];
  var err;

  if (isNaN(offset)) {
    err = new ValidationError(null);
    err.errors.offset = {
      path: "query:offset",
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
      path: "query:limit",
      message: 'limit must be a number',
      type: 'invalid-limit',
      value: limit,
      value_type: "number",
    };
    return error(400, err);
  }


  if (limit) {
    query.limit(limit);
  }
  // http://mongoosejs.com/docs/api.html#query_Query-sort
  // validate sort
  var ss = sort.split(" ");
  var i;
  for (i = 0; i < ss.length; ++i) {
    path = ss[i][0] == "-" ? ss[i].substring(1) : ss[i];
    options = mdl.schema.path(path);
    if (!options) {
      err = new ValidationError(null);
      err.errors.sort = {
        path: "query:sort",
        message: 'not found in schema',
        type: 'invalid-sort',
        label: null,
        value: path,
        value_type: "string",
      };
      return error(400, err);
    }

    if (options.options.restricted) {
      err = new ValidationError(null);
      err.errors.sort = {
        path: "query:sort",
        message: 'field is restricted',
        type: 'invalid-sort',
        label: options.options.label,
        value: path,
        value_type: "string",
      };
      return error(400, err);
    }
  }

  query.sort(sort);

  // populate
  if (!Array.isArray(populate)) {
    err = new ValidationError(null);
    err.errors.populate = {
      path: "query:populate",
      message: 'is not an array',
      type: 'invalid-populate',
      value: populate,
    };
    return error(400, err);
  }

  for (i = 0; i < populate.length; ++i) {
    path = populate[i];
    options = mdl.schema.path(path);
    if (!options) {
      err = new ValidationError(null);
      err.errors.populate = {
        path: "query:populate",
        message: 'not found in schema',
        type: 'invalid-populate',
        value: path,
      };
      return error(400, err);
    }

    if (!exutils.type_can_be_populated(options.options.type)) {
      err = new ValidationError(null);
      err.errors.populate = {
        path: "query:populate",
        message: 'field cannot be populated',
        type: 'invalid-populate',
        value: path,
      };
      return error(400, err);
    }

    if (options.options.restricted) {
      err = new ValidationError(null);
      err.errors.populate = {
        path: "query:populate",
        message: 'field is restricted',
        type: 'invalid-populate',
        value: path,
      };
      return error(400, err);
    }

    query.populate(path);
  }

  // where
  forEach(where, function(val, path) {
    query = query.where(path).equals(val);
    qcount = qcount.where(path).equals(val);
  });

  //console.log(query);

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

function list_middleware(mdl) {
  return function(req, res, next) {
    return list(
      mdl,

      req.query.where,
      req.query.sort,
      req.query.limit,
      req.query.offset,
      req.query.populate,

      res.error,
      function(count, offset, limit, mlist) {
        function mnext() {
          var list = mlist.map(function(d) { return d.toJSON(); });

          // TODO rename
          //list = mdl.before_send("list", list);
          mdl.express.before_send("list", list, function(err, output_list) {
            /* istanbul ignore next */ if (err) {
              return res.error(err);
            }

            // TODO remove and use an autoincrement
            var i;
            for (i = 0; i < output_list.length; ++i) {
              output_list[i].id = output_list[i]._id;
              delete output_list[i] ._id;
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
