var express = require('express');
var router = express.Router();
let multer = require('multer');
let fs = require('fs');
let path = require("path");

/* GET home page. */
router.post('/',multer({
  //设置文件存储路径
 dest: 'upload'   //upload文件如果不存在则会自己创建一个。
}).single('file'), function(req, res, next) {
  if (req.file.length === 0) {  //判断一下文件是否存在，也可以在前端代码中进行判断。
    res.render("error", {message: "上传文件不能为空！"});
    return
} else {
   let file = req.file;
   let fileInfo = {};
   console.log(file);
   var date = new Date()
   var y = date.getFullYear();  
   var m = date.getMonth() + 1;  
   m = m < 10 ? ('0' + m) : m;  
   var d = date.getDate();  
   d = d < 10 ? ('0' + d) : d;  
   var h = date.getHours();  
   var minute = date.getMinutes();  
   minute = minute < 10 ? ('0' + minute) : minute; 
   var second= date.getSeconds();  
   second = minute < 10 ? ('0' + second) : second;  
   var time = (y + m + d + h + minute + second); 
   var extname=path.extname('./upload/'+file.originalname)
   var fileName = `${time}${extname}`
   fs.renameSync('./upload/' + file.filename, './public/images/' + fileName);//这里修改文件名字，比较随意。
   // 获取文件信息
   fileInfo.mimetype = file.mimetype;
   fileInfo.originalname = fileName;
   fileInfo.size = file.size;
   fileInfo.path = file.path;

   // 设置响应类型及编码
   res.set({
     'content-type': 'application/json; charset=utf-8'
  });
  var imgurl = 'http://127.0.0.1:8081/images/'+fileName
   res.json({
     code:200,
     url: imgurl 
   });
}
});

module.exports = router;
