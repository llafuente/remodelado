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

var permissions = require("./permissions.json");

var user_json = require("./user.model.json");
user_json.backend.schema.permissions.array.enum = permissions.enum;
user_json.backend.schema.permissions.array.labels = permissions.labels;
var user = remodelado.model(user_json);
app.use(user.$router);

var roles_json = require("./roles.model.json");
roles_json.backend.schema.permissions.array.enum = permissions.enum;
roles_json.backend.schema.permissions.array.labels = permissions.labels;
var roles = remodelado.model(roles_json);
app.use(roles.$router);

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
