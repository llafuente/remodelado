var app = require("./express.js");

if (!process.argv[1] || process.argv[1].indexOf("mocha") === -1) {
  // Start server
  app.listen(8080, '0.0.0.0', function () {
    console.error(JSON.stringify({
      line: "Express server listening on " + this.address().port + " in " + app.get('env') + " mode"
    }));
  });
}
