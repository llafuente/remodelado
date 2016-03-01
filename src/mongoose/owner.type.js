'use strict';
var mongoose = require('mongoose');
var util = require('util');

function Owner(path, options) {
  mongoose.SchemaTypes.ObjectId.call(this, path, options);
}

util.inherits(Owner, mongoose.SchemaTypes.ObjectId);

mongoose.SchemaTypes.Owner = Owner;
