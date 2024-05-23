var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var showimgRouter = require('./routes/showimg');
var pictureRouter = require('./routes/picture');
var getimgRouter = require('./routes/getimg');
var uploadRouter = require('./routes/upload');
var wordcloudRouter = require('./routes/wordcloud');

var app = express();

/*設定「view engine」為 ejs，在 res.render() 就不用特別指定模板引擎：*/
app.set('view engine', 'ejs');
app.set('views', './views');

/*body-parser use*/
app.use(express.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(express.static('public'));



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/showimg', showimgRouter);
app.use('/picture',pictureRouter);
app.use('/getimg', getimgRouter);
app.use('/upload', uploadRouter);
app.use('/wordcloud', wordcloudRouter);


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

app.use(function(req, res, next){//允許在路由處理函數中通過req.io訪問io實例：
  req.io = req.app.get('io');
  next();
});


module.exports = app;
