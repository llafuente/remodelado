
module.exports = function(app) {
  app.post('/api/users/me', function(req, res, next) {
    // TODO check token
    if (!req.headers['x-access-token']) {
      return res.status(401).json({error: "No session"});
    }

    if (req.headers['x-access-token'] != "Bearer 1235fd1sdfs6f5sd1f6s") {
      return res.status(401).json({error: "Invalid session"});
    }

    res.status(200).json({
      "id": 1,
      "username": "username",
      "permissions": ["do magic"],
      "roles": ["user"],
    });
  });

  app.post('/api/auth', function(req, res, next) {
    res.status(200).json({
      "token": "1235fd1sdfs6f5sd1f6s"
    });
  });

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

  app.use('/api/require-login', function(req, res, next) {
    var status = parseInt(req.params.status);

    if (!req.headers['x-access-token']) {
      return res.status(401).json({
        error: "Url required to be logged"
      });
    }

    return res.status(200).json({});
  });

  app.use('/api/expire-my-session', function(req, res, next) {
    res.set('X-Session-Expired', 1);

    return res.status(401).json({
      error: "session expired"
    });
  });




};
