var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const { getUsers } = require('./firebase/firebase');

const users = getUsers();

findById = function (userId, cb) {
  process.nextTick(function () {
    users
      .then((res) => {
        const user = res.filter(({ id }) => id == userId);
        if (user.length) {
          cb(null, user[0]);
        } else {
          cb(new Error('User ' + userId + ' does not exist'));
        }
      });
  });
}

findByUsername = function (username, cb) {
  process.nextTick(function () {
    users
      .then((res) => {
        for (let i = 0, len = res.length; i < len; i++) {
          var user = res[i];
          if (user.login === username) {
            return cb(null, user);
          }
        }
        return cb(null, null);
      });
  });
}

passport.use(new Strategy(
  function (username, password, cb) {
    findByUsername(username, function (err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password !== password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

module.exports = {
  passport,
};
