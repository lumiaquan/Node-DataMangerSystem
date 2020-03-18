var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var qs = require('querystring');
var bodyParser = require('body-parser')
var url = require("url");

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


var http = require('http');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var imageRouter = require('./routes/image')

var app = express();


app.use(bodyParser.json({limit: '1mb'}));  //这里指定参数使用 json 格式
app.use(bodyParser.urlencoded({
  extended: true
}));

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/image', imageRouter);
// app.use('/addquestion',addquestionRouter)

app.use(bodyParser.urlencoded({extended:false})) 
app.use(bodyParser.json());
app.get('/addquestion',function (req, res, next){
  var getStr = url.parse(req.url).query;
  console.log(getStr)
  res.end('success!')
})
app.post('/addquestion',function (req, res, next) {
  
var query = url.parse(req.url).query;
  console.log(res.body)
  console.log(query)
  var postStr = ''
  console.log('start1')
  req.on('data', (chunk) => {
    console.log('start2')
    postStr += chunk
  })

  req.on('end', (chunk) => {  //接收完成后的操作
    postStr = qs.parse(postStr);
    console.log(postStr)
    res.send({
      code: 200
    });
  })

})

app.post('/add', function (req, res) {
  var postStr1 = qs.stringify(req.body)
  var postStr2 = qs.parse(postStr1)
  console.log(postStr2)
  res.send({
    code: 200
  })

});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



http.createServer(function (req, res) {
  app(req, res)
}).listen(8081);

console.log('Server running at http://127.0.0.1:8081/');

module.exports = app;
