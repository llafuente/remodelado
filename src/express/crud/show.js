'use strict';

module.exports = show_middleware;

function show_middleware(meta, status_code, stored_at) {
  return function(req, res/*, next*/) {
    res.status(status_code);

    if (status_code !== 204) {
      res.json(req[stored_at]);
    }
  };
}
