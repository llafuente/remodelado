'use strict';

module.exports = clean_body;

// clean req.body from data that never must be created/updated
function clean_body(meta, body) {
  /*
  var id = meta.$model.id();
  // clean up body
  delete body[id];
  */

  delete body._id;
  delete body.id;
  delete body.__v;

  delete body.create_at;
  delete body.updated_at;
}
