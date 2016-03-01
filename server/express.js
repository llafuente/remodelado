var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require("mongoose");
var config = require('./config/index.js');
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
    level: 'silly'
  })]
});
logger.setLevels({ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5, db: 4, request: 2 });
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
var util = require('util');
mongoose.set('debug', function (name, i) {
  var args = Array.prototype.slice.call(arguments, 2);

  logger.db(
    util.format(
      '\x1B[0;36mMongoose:\x1B[0m %s.%s(%s) %s %s %s',
      name,
      i,
      util.inspect(args[0], {depth: true, colors: true}),
      util.inspect(args[1], {depth: true, colors: true}),
      util.inspect(args[2], {depth: true, colors: true}),
      util.inspect(args[3], {depth: true, colors: true})
    )
  );
});


var mongoose = require("mongoose");
mongoose.connect(config.mongo.uri);
app.mongoose = mongoose;
app.use(function (req, res, next) {
  req.mongoose = mongoose;
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  // too fast, wait a little!
  mongoose.connection.on('open', function () {
    next()
  });
});

//
// jwt
//
var ex_jwt = require('express-jwt');
app.use(ex_jwt({
  secret: config.auth.secret,
  credentialsRequired: false,
  getToken: function fromHeaderOrQuerystring (req) {
    console.log(req.headers.authorization);
    if (req.headers.authorization) {
      var x = req.headers.authorization.split(' ');
      if (x[0] === 'Bearer') {
        return x[1];
      }
    } else if (req.query && req.query.access_token) {
      return req.query.access_token;
    }
    return null;
  }
}));


//
// TODO properly handle user-login, regenerate session(/me).
//
app.post('/api/users/me', function(req, res, next) {
  // TODO check token
  if (!req.headers.authorization) {
    return res.status(401).json({error: "No session"});
  }

  if (!req.user) {
    return res.status(401).json({error: "Invalid session"});
  }

  res.status(200).json({
    "id": 1,
    "username": "username",
    "permissions": ["do magic"],
    "roles": ["user"],
  });
});

var jwt = require('express-jwt/node_modules/jsonwebtoken');
app.post('/api/auth', function(req, res, next) {
  res.status(200).json({
    "token": jwt.sign({id: 1}, config.auth.secret)
  });
});
