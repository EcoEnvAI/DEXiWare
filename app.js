const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

global.__basedir = __dirname;
global.__tempdir = __dirname + '/node_api/temp/';

const db = require('./node_api/config/database');
// Passport config
require('./node_api/config/passport')(passport);

// Initialize Database
db.sequelize.sync().then(() => {
  console.log('Database sync successfull.');
}).catch((err) => {
  console.log("Error: " + err);
});

const app = express();

// body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express session
app.use(session({
  secret: (process.env.ENV_SECRET || 'KATAKOMBE'),
  resave: true,
  saveUninitialized:true,
  cookie: { secure: false }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', require('./node_api/routes/auth'));
app.use('/', require('./node_api/routes/api'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log('Server started on port ' + PORT));
