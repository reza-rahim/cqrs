var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var passport = require('passport');
var flash = require('connect-flash');
var Redis   = require("redis");
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var validator = require('express-validator');


var routes = require('./routes/index');
var userRoutes = require('./routes/user');

var app = express();
require('./config/passport')

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());

//added 2
var redisHost = process.env.redisHost || 'localhost';
var redisPort = parseInt(process.env.redisPort) || 6379;
var sessionTimeout = parseInt(process.env.sessionTimeout) || 260;
var redisClient = Redis.redisClient


app.use(session({
    secret: 'ssshhhhh',
    // create new redis store.
    store: new redisStore({ host: redisHost, port: redisPort, redisClient: redisClient,ttl :  sessionTimeout}),
    saveUninitialized: false,
    resave: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
   res.locals.login = req.isAuthenticated();
   res.locals.session = req.session;
   next();
});

app.use('/user', userRoutes);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
