'use strict';

module.exports = schema_default;

var _ = require('lodash');
var pluralize = require('pluralize');

var default_schema = {
  type: 'String',
  create: false,
  update: false,
  restricted: {
    create: false,
    update: false,
    read: false
  }
};

function schema_default(meta) {
  var t = meta.backend.schema;
  meta.backend.schema = {};

  _.forEach(t, function(o, k) {
    if (!Array.isArray(o)) {
      meta.backend.schema[k] = o = _.defaults(o, default_schema);
    } else {
      meta.backend.schema[k] = [_.defaults(o[0], default_schema)];
      o = meta.backend.schema[k][0];
    }

    // shortcut: can update/create cant read
    if (o.restricted === true) {
      o.restricted = {
        create: false,
        update: false,
        read: true
      };
    }

    // shortcut: can update/create/read
    if (o.restricted === false) {
      o.restricted = {
        create: false,
        update: false,
        read: false
      };
    }
  });

  meta.plural = pluralize(meta.singular);

  meta.$init = [];

  meta.init = function() {
    var i;
    for (i = 0; i < this.$init.length; ++i) {
      this.$init[i]();
    }
  };
}
