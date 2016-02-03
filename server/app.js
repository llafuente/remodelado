var app = require("./express.js");
var express = require('express');
var join = require('path').join;
var winston = require('winston');

//app.use('/', express.static(join(__dirname, 'app')));
//app.use('/', express.static(join(__dirname, 'dist')));

app.use('/', express.static('dist'));
app.use('/', express.static('app'));

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/ubermodel");

var remodelado = require("../src/index.js");
remodelado.use(mongoose);


var logger = new (winston.Logger)({
  transports: [new (winston.transports.Console)({
    prettyPrint: true,
    level: 'silly',
    handleExceptions: true
  })]
});

var user_json = require("../tests/user.model.json");
var user = remodelado.model(user_json);


app.use(user.router);

if (!process.argv[1] || process.argv[1].indexOf("mocha") === -1) {
  // Start server
  app.listen(8081, '0.0.0.0', function () {
    console.error("# Express server listening on " + this.address().port + " in " + app.get('env') + " mode");
  });
}
