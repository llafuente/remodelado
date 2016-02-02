module.exports = schema_express;

var _ = require('lodash');

function schema_express(json) {

  var id_param = json.singular + '_id';
  json.$express = {
    id_param: id_param,
    list: '/' + json.plural,
    create: '/' + json.plural,
    read: '/' + json.plural + '/:' + id_param,
    update: '/' + json.plural + '/:' + id_param,
    delete: '/' + json.plural + '/:' + id_param,

  };
}
