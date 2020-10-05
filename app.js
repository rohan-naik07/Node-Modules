var config = require('./config');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');  // prints out the trace of requets to the command line
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');

const mongoose = require('mongoose');   
const url = config.mongoUrl;
const connect = mongoose.connect(url);   // connection method which returns promise

//when client requests for a service , if authentication header is not included,server sends authorization challenge
// in the response header. 
connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();

app.all('*',(req,res,next)=>{
  if(req.secure){
    return next(); // if req is already on secure server then req.secure is true
  }
  else{
    res.redirect(307,'https://' + req.hostname + ':' + app.get('secPort') + req.url); // redirect to secure server
  }
})
/*
307 here represents that the target resource resides temporarily under different URL. 
And the user agent must not change the request method if it reforms in automatic redirection to that URL. 
So, I'll be expecting user agent to retry with the same method that they have used for the original end point. 
 */

app.use(passport.initialize());
app.use(passport.session());

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
var favoriteRouter = require('./routes/favouritesRouter');
var commentRouter = require('./routes/commentsRouter');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());  //secret key for signed cookie
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
app.use('/imageUpload',uploadRouter);
app.use('/favorites',favoriteRouter);
app.use('/comments',commentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
