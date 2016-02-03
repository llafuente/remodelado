var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require("mongoose");
var ValidationError = mongoose.Error.ValidationError;
var forEach = require('lodash.foreach');

//
// express initialization
//

var app = express();
app.use(bodyParser.json());
app.use(methodOverride());
app.use(function(req, res, next) {
  console.log("    ##", req.method, req.url);
  next();
});

//
// logs
//

var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [new (winston.transports.Console)({
    prettyPrint: true,
    level: 'silly',
    handleExceptions: true
  })]
});
app.use(function(req, res, next) {
  req.log = logger;
  next();
});

//
// mongoose errors
//

var mongoose = require('mongoose');
var messages = mongoose.Error.messages;

// TODO access model.errors and override this default values!
messages.general.default = "err-validator-failed";
messages.general.required = "err-required";
messages.Number.min = "err-min";
messages.Number.max = "err-max";
messages.Date.min = "err-min";
messages.Date.max = "err-max";
messages.String.enum = "err-out-of-bounds";
messages.String.match = "err-match";
messages.String.minlength = "err-minlength";
messages.String.maxlength = "err-maxlength";

module.exports = app;
