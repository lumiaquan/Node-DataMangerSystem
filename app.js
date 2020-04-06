var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var qs = require('querystring');
var bodyParser = require('body-parser')
var url = require("url");
var MongoClient = require('mongodb').MongoClient;
var mongourl = 'mongodb://localhost:27017/';

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var ObjectId = require('mongodb').ObjectId

var http = require('http');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var imageRouter = require('./routes/image')

var app = express();


app.use(bodyParser.json({ limit: '1mb' }));  //这里指定参数使用 json 格式
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

var dbName = "xiaotiku"

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/getQuestion', function (req, res) {
  var params = url.parse(req.url, true).query;
  console.log(params)
  MongoClient.connect(mongourl, { useUnifiedTopology: true }, function (err, client) {
    if (err) {
      console.log(err)
    }
    const db = client.db(dbName)
    db.collection("questions").find({"zhuti":params.zhuti,"zhangjie":params.zhangjie}).toArray((err, data) => {
      if (err) {
        console.log(err)
      }
      console.log("获取questionList成功！")
      client.close()
      res.send(data)
    })
  })
})



app.post('/add', function (req, res) {
  var postStr1 = qs.stringify(req.body)
  var postStr2 = qs.parse(postStr1)
  MongoClient.connect(mongourl, { useUnifiedTopology: true }, function (err, client) {
    const db = client.db(dbName);  //数据库db对象
    db.collection("questions").find({ "zhangjie": postStr2.zhangjie,"zhuti": postStr2.zhuti }).toArray((err, data) => {
      if (err) {
        console.log(err)
      }
      postStr2.number = (data.length + 1).toString()
      console.log(data[0])
      db.collection("questions").insertOne(postStr2, function (err, reslut) {
        if (err) {
          console.log(err)
        }
        console.log("插入成功！")
        client.close()
        res.send({
          code: 200
        })

      })
    })
  })
});

app.post('/addUserInfo', function (req,res){
  var postStr1 = qs.stringify(req.body)
  var postStr2 = qs.parse(postStr1)
  postStr2["cuotiList"] = []
  postStr2["thumbsUp"] = []
  postStr2["collection"] = []
  MongoClient.connect(mongourl, { useUnifiedTopology: true }, function (err, client) {
    const db = client.db(dbName);  //数据库db对象
    db.collection("userInfo").insertOne(postStr2, function (err, reslut) {
      if (err) {
        console.log(err)
      }
      console.log("添加成功")
      client.close()
      res.send({
        code: 200
      })
    })
  })
})

app.post('/addCuoti', function (req,res){
  var postStr1 = qs.stringify(req.body)
  var postStr2 = qs.parse(postStr1)
  MongoClient.connect(mongourl, { useUnifiedTopology: true }, function (err, client) {
    const db = client.db(dbName);  //数据库db对象
    db.collection("userInfo").find({"openId": postStr2.openId}).toArray(function(err,reslut){
      if (err) {
        console.log(err)
      }
      for(var i=0;i<reslut[0].cuotiList.length;i++){
        var a = postStr2.cuotiList.includes(reslut.cuotiList[i])
        if(a == false){
          postStr2.cuotiList.push(reslut.cuotiList[i])
        }
      }
    })
    db.collection("userInfo").updateOne({"openId":postStr2.openId},{$set:{"cuotiList":postStr2.cuotiList}}, function (err, reslut) {
      if (err) {
        console.log(err)
      }
      console.log("修改cuotiList成功")
      client.close()
      res.send({
        code: 200
      })
    })
  })
})

app.get('/getCuoti',function (req,res){
  var params = url.parse(req.url, true).query;
  MongoClient.connect(mongourl, { useUnifiedTopology: true }, function (err, client) {
    if (err) {
      console.log(err)
    }
    const db = client.db(dbName)
    db.collection("userInfo").find({"openId":params.openId}).toArray((err, data) => {
      if (err) {
        console.log(err)
      }
      data1 = data
      console.log("获取用户数据成功！")
      client.close()
      res.send(data)
    })
  })
})

app.post('/getCuotiList', function (req, res){
  var postStr = req.body.cuotiList
  for(var i=0;i<postStr.length;i++){
    postStr[i] = ObjectId(postStr[i])
  }
  var cuotiList = []
  MongoClient.connect(mongourl, { useUnifiedTopology: true }, function(err,client){
    if (err) {
      console.log(err)
    }
    const db = client.db(dbName)
    db.collection("questions").find({"_id": {$in: postStr}}).toArray((err,data)=>{
      if(err){
        console.log(err)
      }
      console.log(data)
      res.send(data)
    })
  })
})

app.post('/addZhangjie', function (req, res) {
  var postStr1 = qs.stringify(req.body)
  var postStr2 = qs.parse(postStr1)
  MongoClient.connect(mongourl, { useUnifiedTopology: true }, function (err, client) {
    const db = client.db(dbName);  //数据库db对象
    db.collection("zhangjieguanli").find({"zhuti": postStr2.zhuti,"tiku": postStr2.tiku}).toArray((err,data)=>{
      if(data.length>0){
        for(var i=0;i<data[0].zhangjie.length;i++){
          if(data[0].zhangjie[i].includes(postStr2.zhangjie)){

          }else{
            data[0].zhangjie.push(postStr2.zhangjie)
          }
        }
        db.collection("zhangjieguanli").updateOne({"zhuti": postStr2.zhuti},{$set:{"zhangjie":data[0].zhangjie}},function(err,reslut){
          if (err) {
            console.log(err)
          }
          console.log("更新章节成功！")
          client.close()
          res.send({
            code: 200
          })
        })
      }else{
        db.collection("zhangjieguanli").insertOne({ "tiku": postStr2.tiku, "zhuti": postStr2.zhuti, "zhangjie": [postStr2.zhangjie], "subzhuti": postStr2.subzhuti }, function (err, reslut) {
          if (err) {
            console.log(err)
          }
          console.log("添加成功！")
          client.close()
          res.send({
            code: 200
          })
        })
      }
    })
  })
});

app.get('/getMulu', function (req, res) {
  var params = url.parse(req.url, true).query;
  MongoClient.connect(mongourl, { useUnifiedTopology: true }, function (err, client) {
    if (err) {
      console.log(err)
    }
    const db = client.db(dbName)
    db.collection("zhangjieguanli").find({"tiku": params.tiku}).toArray((err, data) => {
      if (err) {
        console.log(err)
      }
      console.log("获取目录成功！")
      client.close()
      res.send(data)
    })
  })
})

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
