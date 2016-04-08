'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var config = require('./config/index.js');
var util = require('util');
require('./winston-readable-console.js');
//
// express initialization
//

var app;
module.exports = app = express();

app.use(bodyParser.json());
app.use(methodOverride());

//
// logs
//

var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [new (winston.transports.ReadableConsole)({
    level: 'silly',
    trace: false
  })]
});
logger.setLevels({
  error: 0,
  warn: 1,
  info: 2,
  request: 2,
  verbose: 3,
  db: 3,
  debug: 4,
  silly: 5,
  all: 6, // max verbosity
});
app.use(function(req, res, next) {
  req.log = logger;
  next();
});
app.use(function(req, res, next) {
  req.log.request(`START ${req.method} ${req.url}`);
  res.on('finish', function() {
    req.log.request(`END ${req.method} ${req.url} with ${res.statusCode}`);
  });
  next();
});
logger.info(config);

// hack to allow log everywhere
global.$log = logger;

//
// mongoose
//

mongoose.set('debug', function(name, i) {
  var args = Array.prototype.slice.call(arguments, 2);

  logger.db(
    util.format(
      '\x1B[0;36mMongoose:\x1B[0m %s.%s(%s) %s %s %s',
      name,
      i,
      util.inspect(args[0], {depth: null, colors: true}),
      util.inspect(args[1], {depth: null, colors: true}),
      util.inspect(args[2], {depth: null, colors: true}),
      util.inspect(args[3], {depth: null, colors: true})
    )
  );
});
mongoose.connect(config.mongo.uri);
mongoose.connection.once('open', function () {
  app.emit('init');
});
app.mongoose = mongoose;
app.use(function(req, res, next) {
  req.mongoose = mongoose;
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  // too fast, wait a little!
  mongoose.connection.on('open', function() {
    next();
  });
});
