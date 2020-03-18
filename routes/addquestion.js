var express = require('express');
var router = express.Router();
var qs = require('querystring');

/* GET home page. */
router.post('/addquestion', function(req, res, next) {
  console.log('start')
  var postStr =''
  console.log('start1')
  req.on('data',(chunk)=>{
    console.log('start2')
      postStr+=chunk
  })
 
	req.on('end',(chunk) => {  //接收完成后的操作
		postStr=qs.parse(postStr);
		console.log(postStr)
		res.json({
      code: 200
    });
	})
});

module.exports = router;
