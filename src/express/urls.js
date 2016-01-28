module.exports = urls;

var pluralize = require('pluralize');
var assert = require('assert');

// generate urls for given model
// mdl must be incomplete, no model!
function urls(mdl) {
  assert.ok(mdl.model === undefined);

  mdl.read_url =
  mdl.delete_url =
  mdl.update_url = '/' + pluralize(mdl.name) + '/:' + mdl.name + '_id';

  mdl.create_form =
  mdl.create_url =
  mdl.list_url = '/' + pluralize(mdl.name);

  mdl.create_form += '/form';
}
