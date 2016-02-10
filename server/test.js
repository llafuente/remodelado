
module.exports = function(app) {
  //timeout for testing purposes
  app.use(function(req, res, next) {
    setTimeout(function() {
      next();
    }, 500);
  });

  app.use('/api/error-single/:status', function(req, res, next) {
    var status = parseInt(req.params.status);
    res.status(status).json({
      error: "This is the error text"
    });
  });

  app.use('/api/error-list/:status', function(req, res, next) {
    var status = parseInt(req.params.status);
    res.status(status).json({
      error: [
        "This is a error list",
        "here you have more text",
        "and more!!!"
      ]
    });
  });

  app.use('/api/error-template/:status', function(req, res, next) {
    var status = parseInt(req.params.status);
    res.status(status).json({
      type: "retryable",
      error: [
        "This is a error list",
        "here you have more text",
        "and more!!!"
      ]
    });
  });


};
