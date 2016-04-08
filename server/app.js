'use strict';

var app = require('./express.js');
var express = require('express');

app.use('/', express.static('dist'));
// e2e test
app.use('/', express.static('tmp/instrumented/app'));
app.use('/', express.static('app'));
app.use('/src', express.static('bower_components/inetsys-angular-seed/src'));

var modelador = require('../src/index.js');
var mongoose = require('mongoose');
var config = require('./config/index.js');
var api = new modelador(config, mongoose);
app.once('ready', function() {
  api.init(function() {

    if (!process.argv[1] || process.argv[1].indexOf('mocha') === -1) {
      // Start server
      app.listen(8081, '0.0.0.0', function() {
        console.error('# Express server listening on ' + this.address().port + ' in ' + app.get('env') + ' mode');
      });
    }

  });
});
app.use(api.$router);
