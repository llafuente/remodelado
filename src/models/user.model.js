'use strict';

var user_json = require('js-yaml').load(require('fs')
  .readFileSync(`${__dirname}/user.model.yml`, 'utf8'));

var crypto = require('crypto');
var jwt = require('express-jwt/node_modules/jsonwebtoken');
var ex_jwt = require('express-jwt');
var express = require('express');
var http_error = require('../express/http.error.js');
var error_handler = require('../express/error-handler.js');

function makeSalt() {
  return crypto.randomBytes(16).toString('base64');
}

function encryptPassword(password, salt) {
  if (!password || !salt) {
    return null;
  }

  var salt_buff = new Buffer(salt, 'base64');
  return crypto.pbkdf2Sync(password, salt_buff, 10000, 64).toString('base64');
}

module.exports = function(modelador, config) {
  var user = modelador.model(user_json);
  user.$schema.pre('save', function update_password_hash(next) {

    if (this.isModified('password')) {
      this.salt = makeSalt();
      this.password = encryptPassword(this.password, this.salt);
    }

    next();
  });

  /**
   * Authenticate - check if the passwords are the same
   */
  user.$schema.methods.authenticate = function authenticate(plainText) {
    return encryptPassword(plainText, this.salt) === this.password;
  };

  user.$schema.methods.has_permission = function has_permission(perm) {
    if (this.permissions.indexOf(perm) === -1) {
      // look at roles
      var found = false;
      var i;

      for (i = 0; i < this.roles.length; ++i) {
        if (this.roles[i].permissions.indexOf(perm) !== -1) {
          found = true;
        }
      }

      return found;
    }
    return true;
  };

  // TODO do it!
  /* istanbul ignore next */
  user.$schema.methods.filter_query = function filter_query(query, cb) {
    if (!this.populated('roles')) {
      this.populate('roles', function(err, user) {
        if (err) {
          return cb(err);
        }

        user.filter_query(query, cb);
      });
    }
    /*
    if (!this.populated('groups')) {
      this.populate('groups', function(err, user) {
        if (err) {
          return cb(err);
        }

        user.filter_query(query, cb)
      })
    }
    */

    //var roles = this.populated('roles');
    //query.in(groups, this.populated('groups'));

    return cb(null, query);
  };


  // prio:
  // * /users/auth, first so we can always login, even with
  // and invalid session
  // * jwt token validation
  // * get user from database
  // * the rest
  var r = express.Router();

  r.post('/users/auth', function(req, res, next) {

    user.$model.findOne({
      username: req.body.username
    }, function(err, user) {
      /* istanbul ignore next */ if (err) {
        return next(err);
      }

      if (!user || !user.authenticate(req.body.password)) {
        return next(new http_error(422, 'user not found or invalid pasword'));
      }

      res.status(200).json({
        'token': jwt.sign({
          id: user._id.toString(),
          session_start: (new Date()).toString()
        }, config.auth.secret)
      });
    });
  });

  //
  // jwt
  //
  r.use(ex_jwt({
    secret: config.auth.secret,
    credentialsRequired: false,
    getToken: function from_header_or_querystring(req) {
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


  r.use(function(req, res, next) {
    if (req.user && req.user.id) {
      req.log.silly('regenerate session: ' + req.user.id.toString());

      return user.$model
      .findOne({
        _id: req.user.id
      })
      .populate('roles')
      .exec(function(err, dbuser) {
        if (err || !dbuser) {
          return next(new http_error(401, 'regenerate session failed'));
        }

        req.user = dbuser;
        req.log.silly('user logged: ' + JSON.stringify(dbuser.toJSON()));
        next();

      });
    }
    next();
  });

  r.post('/users/me', function(req, res, next) {
    // TODO check token
    if (!req.headers.authorization) {
      return next(new http_error(401, 'no session'));
    }

    if (!req.user) {
      return next(new http_error(401, 'invalid session'));
    }

    var u = req.user.toJSON();
    user.$express.formatter(req, u, function(err, output) {
      res.status(200).json(output);
    });
  });


  r.use(error_handler.middleware);

  r.use(user.$router);
  user.$router = r;

  return user;
};
