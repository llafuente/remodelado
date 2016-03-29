'use strict';

module.exports = HttpError;

function HttpError(status, message) {
  this.name = 'HttpError';
  this.message = message || 'Internal error';
  this.status = status || 500;
  this.stack = (new Error()).stack;
}

HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.constructor = HttpError;
