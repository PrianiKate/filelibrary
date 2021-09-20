const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { getFileLinksByUser } = require('./firebase/firebase');
const { passport } = require('./passport');

app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(require('morgan')('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
  res.render('login', { message: '' });
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/main');
  });

app.get('/main',
  require('connect-ensure-login').ensureLoggedIn(),
  (req, res) => {
    getFileLinksByUser(req.user.login).then((fileLinksArr) => {
      res.render('main', {
        files: fileLinksArr,
      });
    });
  });

app.post('/exit',
  require('connect-ensure-login').ensureLoggedIn(),
  (req, res) => {
    req.logout();
    res.redirect('/login');
  });

app.listen(3000);
