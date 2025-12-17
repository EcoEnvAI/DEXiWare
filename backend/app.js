const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

var { migrationSync } = require('./dbutils.js')

global.__basedir = __dirname;
global.__tempdir = __dirname + '/node_api/temp/';

const db = require('./node_api/config/database');
// Passport config
require('./node_api/config/passport')(passport);

// Swagger configuration
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dexiware API',
      version: '1.0.0',
      description: 'API documentation for Dexiware',
    },
  },
  apis: [`${__dirname}/node_api/routes/**/*.js`],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Apply migrations
migrationSync();

/*
// Initialize Database
db.sequelize.sync().then(() => {
  console.log('Database sync successfull.');
}).catch((err) => {
  console.log("Error: " + err);
});*/

const app = express();

// body parser
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Express session
app.use(session({
  secret: (() => {
    const secret = process.env.SESSION_SECRET;
    if (secret == null || String(secret).trim() === '') {
      throw new Error('Missing required environment variable: SESSION_SECRET');
    }
    return secret;
  })(),
  resave: true,
  saveUninitialized:true,
  cookie: { secure: false }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// routes
app.use('/', require('./node_api/routes/auth'));
app.use('/', require('./node_api/routes/api'));

const PORT = (() => {
  const raw = process.env.PORT;
  if (raw == null || String(raw).trim() === '') {
    throw new Error('Missing required environment variable: PORT');
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer environment variable PORT: ${raw}`);
  }
  return parsed;
})();

app.listen(PORT, console.log('Server started on port ' + PORT));
