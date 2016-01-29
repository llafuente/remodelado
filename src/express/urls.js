module.exports = urls;

var pluralize = require('pluralize');
var assert = require('assert');

// generate urls for given model
// mdl must be incomplete, no model!
function urls(mdl) {
  assert.ok(mdl.model === undefined);

  var plural = mdl.plural = pluralize(mdl.name);

  mdl.param_url = mdl.name + '_id';

  mdl.read_url =
  mdl.delete_url =
  mdl.update_url = '/' + plural + '/:' + mdl.param_url;

  var base = '/' + plural;
  mdl.create_url = base;
  mdl.list_url = base;

  mdl.routes_url = base + '/angular/routes.js';
  mdl.forms_url = base + '/angular/controls.tpl.html';
  mdl.list_tpl = base + '/angular/list.tpl.html';
}
