var app = require("./express.js");
var express = require('express');
var join = require('path').join;
var winston = require('winston');
var _ = require('lodash');

require('./test.js')(app);

//app.use('/', express.static(join(__dirname, 'app')));
//app.use('/', express.static(join(__dirname, 'dist')));

app.use('/', express.static('dist'));

app.use('/', express.static('tmp/instrumented/app'));
app.use('/', express.static('app'));
app.use('/src', express.static('bower_components/inetsys-angular-seed/src'));

var modelador = require("../src/index.js");
var mongoose = require("mongoose");
var config = require('./config/index.js');
var api = new modelador(config, mongoose);
app.use(api.$router);


/*
var order_json = require("../tests/order.model.json");
var order = remodelado.model(order_json);
app.use(order.$router);
*/

if (!process.argv[1] || process.argv[1].indexOf("mocha") === -1) {
  // Start server
  app.listen(8081, '0.0.0.0', function () {
    console.error("# Express server listening on " + this.address().port + " in " + app.get('env') + " mode");
  });
}
