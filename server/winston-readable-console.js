'use strict';

var util = require('util');
var winston = require('winston');
var ReadableConsole = winston.transports.ReadableConsole = function(options) {
  //
  // Name this logger
  //
  this.name = 'ReadableConsole';

  //
  // Set the level from your options
  //
  this.level = options.level || 'info';
  this.trace = options.trace || false;
  this.std = options.std || process.stdout;
  this.styles = options.styles || {
    error: [41, 49],
    warn: [43, 49],
    info: [42, 49],
    verbose: null,
    debug: null,
    silly: null,
    db: [45, 49],
    request: [46, 49]
  };

  //
  // Configure your storage backing as you see fit
  //
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(ReadableConsole, winston.Transport);

ReadableConsole.prototype.log = function(level, msg, meta, callback) {
  //
  // Store this message and metadata, maybe use some custom logic
  // then callback indicating success.
  //

  var text;

  if (this.styles[level]) {
    level = '\u001b[' + this.styles[level][0] + 'm' + level + '\u001b[' + this.styles[level][1] + 'm';
  }


  if (meta instanceof Error) {
    msg = meta;
    meta = null;
  }

  var depth = level == 'silly' ? null : 4;

  if (msg instanceof Error) {
    text = util.inspect(msg, {depth: depth, colors: true});
    text += '\n' + msg.stack.split('\n').slice(0, 5).join('\n');
  } else if ('string' === typeof msg) {
    text = msg;
  } else {
    text = util.inspect(msg, {depth: depth, colors: true});
  }

  var stack = new Error().stack.split('\n').slice(8, 9).join('\n').trim();
  this.std.write([
    level,
    text,
    util.inspect(meta, {depth: depth, colors: true}),
    '\n'
  ].join(' '));


  if (this.trace) {
    this.std.write('trace');
    this.std.write(stack);
  }

  callback(null, true);
};
