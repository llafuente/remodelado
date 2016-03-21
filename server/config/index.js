'use strict';

var _ = require('lodash');
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
var env_config = require('./' + process.env.NODE_ENV + '.js');
var def_config = {
  mongo: {
    uri: 'mongodb://localhost/ubermodel'
  },
  auth: {
    secret: 's3cr3tp4ssw0rd'
  }
};

module.exports = _.merge(def_config, env_config);
