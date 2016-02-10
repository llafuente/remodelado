var app = require("./express.js");
var express = require('express');
var join = require('path').join;
var winston = require('winston');

//timeout for testing purposes
app.use(function(req, res, next) {
  setTimeout(function() {
    next();
  }, 500);
});

//app.use('/', express.static(join(__dirname, 'app')));
//app.use('/', express.static(join(__dirname, 'dist')));

app.use('/', express.static('dist'));

app.use('/', express.static('tmp/instrumented/app'));
app.use('/', express.static('app'));


app.post('/api/users/me', function(req, res, next) {
  // TODO check token
  if (!req.headers['x-access-token']) {
    return res.status(401).json({error: "No session"});
  }

  if (req.headers['x-access-token'] != "1235fd1sdfs6f5sd1f6s") {
    return res.status(401).json({error: "Invalid session"});
  }

  res.status(200).json({
    "id": 1,
    "username": "username",
    "permissions": ["do magic"],
    "roles": ["user"],
  });
});

app.post('/api/auth', function(req, res, next) {
  res.status(200).json({
    "token": "1235fd1sdfs6f5sd1f6s"
  });
});

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

var user_json = require("./user.model.json");
var user = remodelado.model(user_json);
app.use(user.$router);

var order_json = require("../tests/order.model.json");
var order = remodelado.model(order_json);
app.use(order.$router);


if (!process.argv[1] || process.argv[1].indexOf("mocha") === -1) {
  // Start server
  app.listen(8081, '0.0.0.0', function () {
    console.error("# Express server listening on " + this.address().port + " in " + app.get('env') + " mode");
  });
}
