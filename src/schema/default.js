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
      meta.backend.schema[k] = _.defaults(o, default_schema);
    } else {
      meta.backend.schema[k] = o;
    }

    if (meta.backend.schema[k].restricted === true) {
      meta.backend.schema[k].restricted = {
        create: false,
        update: false,
        read: true
      };
    }
    console.log(meta.backend.schema[k]);
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
