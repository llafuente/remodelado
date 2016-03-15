var user_json = require("./user.model.json");
var crypto = require('crypto');

function makeSalt() {
  return crypto.randomBytes(16).toString('base64');
}

function encryptPassword(password, salt) {
  if (!password || !salt) {
    return null;
  }

  var salt_buff = new Buffer(salt, 'base64');
  return crypto.pbkdf2Sync(password, salt_buff, 10000, 64).toString('base64');
}

module.exports = function(modelador, app) {
  var user = modelador.model(user_json);
  user.$schema.pre('save', function update_password_hash(next) {

    if (this.isModified('password')) {
      this.salt = makeSalt();
      this.password = encryptPassword(this.password, this.salt);
    }

    next();
  });

  /**
   * Authenticate - check if the passwords are the same
   */
  user.$schema.methods.authenticate = function authenticate(plainText) {
    return encryptPassword(plainText, this.salt) === this.password;
  };

  user.init();

  return user;
}
