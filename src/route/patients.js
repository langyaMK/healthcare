var express = require("express");
var patients = express.Router();
var request = require('request');
var querystring = require("querystring");
var jwt = require("jwt-simple");
var url = require("url");
var redis = require('redis');
var secret = "jiankangyiliao";
const tokenExpiresTime = 1000 * 60 * 60 * 24 * 7  //毫秒为单位 这里是7天
var Patient = require('../model/patient.js');
var client = require("../redisConnect.js");

var usermodel = {_id:1,name:1,phone:1,identityCode:1};
var adminmodel = {_id:1,openid:1,name:1,phone:1,identityCode:1};

patients.post("/sessions", (req, response) => {
    // users.post("/login", async(req, response) => {
    console.log("/api/users/sessions");
    console.log(`req.body ${req.body}`);
    var appid = "wx23ab52eb69b7e1c4";
    var appsecret = require('../APPSecret');
    console.log(appsecret);
    console.log(`req.bode.code ${req.body.code}`);

    // var redis = require('redis'),
    //     RDS_PORT = 6379,            //端口号
    //     RDS_HOST = '127.0.0.1',     //服务器IP
    //     RDS_PWD = 'health',
    //     RDS_OPTS = { auth_pass: RDS_PWD },    //设置项
    //     client = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);

    // client.on('ready', function (res) {
    //     console.log('ready');
    // });

    if (req.body.code) {
        var param = {
            appid: appid,
            secret: appsecret,
            js_code: req.body.code,
            grant_type: "authorization_code"
        };
        var options = {
            method: "get",
            url: "https://api.weixin.qq.com/sns/jscode2session?" + querystring.stringify(param)
        };
        console.log(`url ${options.url}`);

        request(options, (err, res, body) => {
            console.log(`res.body ${res.body}`)
            if (body) {
                console.log(res.statusCode);
                console.log(`body ${body}`);
                //解析返回的json数据包
                var resdata = JSON.parse(body);
                console.log(`openid ${resdata.openid}`);

                let payload = {
                    username: resdata.openid,
                    //identity: 1=用户  2=医生  3=管理员
                    identity: 1,
                    expires: Date.now() + tokenExpiresTime
                }
                //jwt-simple包提供的方法
                let token = jwt.encode(payload, secret);
                console.log(`jwt token ${token}`);
                response.send({ error: null, jwt: token});
                //存token
                //TODO 可能会出现异步问题
                client.set(resdata.openid, token, redis.print);
                console.log('存token进redis');

            } else {
                console.log("没有请求到包体");
                response.send({ error: "访问微信api出现问题" });
            }
        })
    } else {
        console.log("没有查到code")
    }
})

//根据jwt中openid查找用户信息,管理员也可访问
patients.get("/",function(req,res){
    var id = url.parse(req.url, true).query;
    if (req.identity == 1) {
        Patient.find({openid:req.username}, usermodel, 
            function (err, result) {
            //console.log(result);
            res.send(result);
        });
    } else if(req.identity == 2 || req.identity == 3){
        Patient.find(id, adminmodel, 
            function (err, result) {
            //console.log(result);
            res.send(result);
        });
    } else {
        res.status(400).send({ message: "错误" });
    }
})

//添加新病人
patients.post("/",function(req,res){
    console.log(req.body);
    req.body.openid = req.username;
    //var reponse=JSON.parse(res);
    if (req.body.name && req.body.identityCode) {
        Patient.insertPatient(req.body, function (err) {
            // console.log(result);
            //res.send(result);
            if (err) {
                if (err.code == 11000) {
                    res.status(400).send({ message: "身份证号重复" });
                }
                else {
                    console.log(err);
                    res.status(400).send({
                        message: err
                    });
                }
            } else {
                res.send({message:"添加成功"});
            }
        })
    } else {
        res.status(400).send({message:"没有name或身份证"});
    }
})

//删除病人本人信息
patients.delete("/", function (req, res) {
    console.log(req.username);
    Patient.remove({openid: req.username} , function (err, result) {
        res.send(result);
    })
})

module.exports = patients;