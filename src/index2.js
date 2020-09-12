var express = require('express');
var mongoose = require('mongoose');
const router = require("./router");
var app = express();
var bodyParser = require('body-parser');
var expressSession = require('express-session')

// var key = fs.readFileSync("2_www.mgxwz.com.key");
// var cert = fs.readFileSync("1_www.mgxwz.com_bundle.crt");

//var https = require('https');
//var connection = require('./connection');

// https.createServer({
// 	key:key,
// 	cert:cert
// },app).listen(8086,function() {
// 	console.log("run on 8086 changed");
// });

mongoose.set('useCreateIndex', true)
mongoose.connect("mongodb://localhost/hc",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true
    },
    function (err) {
        if (err) {
            console.log('Connection Error:' + err)
        } else {
            console.log('Connection success!')
        }
    })
mongoose.connection.on('connected', function () {
    console.log('mongodb连接成功');
});

//配置 bodyparser用于解析post请求，一定要在挂在请求之前
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(expressSession({
    name: "hc",
    secret: 'healthcare', // 对session id 相关的cookie 进行签名
    resave: false,
    rolling: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie: {
        maxAge: 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
    },
}));

//配置跨域请求
/*app.all('*',(req,res,next)=>{
    //设置允许跨域响应报文头
    //设置跨域
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods","*");
    res.setHeader('Content-Type','application/json;charset=utf-8');
    if('OPTIONS' === req.method ) {
        res.send(200)
    } else {
        next()
    }
});*/

app.use("/api", router);
app.use("/upload",express.static("upload"));

app.listen(8080, () => console.log('Example app listening on port 8080!'));