module.exports = clean_body;

function clean_body(mdl, body) {
  /*
  var id = mdl.model.id();
  // clean up body
  delete body[id];
  */

  delete body._id;
  delete body.id;

  delete body.create_at;
  delete body.updated_at;
}
