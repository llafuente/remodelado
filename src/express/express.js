module.exports = express;

var _ = require("lodash");

function before_send_cb (method, data, cb) {
  cb(null, data);
}

function express(mdl) {
  mdl.express = _.cloneDeep(mdl.json.express || {});
  mdl.express.before_send = mdl.express.before_send || before_send_cb;
}
