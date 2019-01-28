var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var chunk = require('chunk');
var Redis = require('../models/redis');
var redisClient = Redis.redisClient

passport.serializeUser(function (user, done) {
    done(null, user.email);
});

passport.deserializeUser(function (email, done) {
    redisClient.hgetall("user:"+email,function (err, user){
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
           messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    redisClient.hgetall("email:",function (err, user){
        
        if(err) {
            return done(err);
        }
        if(user) {
            return done(null, false, {message: 'Email is already in use.'});
        }

        var newUser = {}
        newUser.password=password;
        newUser.email=email;

        redisClient.hmset("user:"+email, "email", email, "password", password);
        return done(null, newUser);

    });
}));


passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    redisClient.hgetall("user:"+email,function (err, user){
       if(err) {
            return done(err);
        }
        if(!user) {
            return done(null, false, {message: 'No user found.'});
        }
        if( !(user.password == password)) {
            return done(null, false, {message: 'Wrong password.'});
        }
        return done(null, user); 
    });
    
}));
