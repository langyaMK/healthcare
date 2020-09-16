var express = require('express');
var doctors = express.Router();
const url = require('url');
var jwt = require("jwt-simple");
var secret = "jiankangyiliao";
const tokenExpiresTime = 1000 * 60 * 60 * 24 * 7  //毫秒为单位 这里是7天
var Docotor = require("../model/doctor.js");
var client = require("../redisConnect.js");

var usermodel = { _id: 1, name: 1, age: 1, sex: 1, rank: 1, office: 1, detail: 1, specialise: 1 };
var doctormodel = { _id: 1, username: 1, isAdmin: 1, name: 1, age: 1, sex: 1, rank: 1, office: 1, detail: 1, specialise: 1 };
var adminmodel = { _id: 1, username: 1, password: 1, isAdmin: 1, name: 1, age: 1, rank: 1, pro: 1, office: 1, detail: 1, specialise: 1 };
var model;

doctors.post('/sessions', async (req, res, next) => {
    console.log('/sessions');
    console.log("body:" + req.body);

    try {
        let doctorInformation = await Docotor.findOne({
            "username": req.body.username
            // "password":req.body.password
        }
        )
        console.log(doctorInformation)
        //如果账号存在
        if (doctorInformation) {
            // console.log(doctorInformation.password)
            if (doctorInformation.password == req.body.password) {
                //生成token
                //identity: 1=用户  2=医生  3=管理员
                var identity;
                console.log(doctorInformation.isAdmin);
                if (doctorInformation.isAdmin) {
                    identity = 3;
                } else {
                    identity = 2;
                }

                let payload = {
                    username: doctorInformation.username,
                    identity: identity,
                    expires: Date.now() + tokenExpiresTime
                }
                //jwt-simple包提供的方法
                let token = jwt.encode(payload, secret);
                //将token存入redis
                //TODO 可能会有异步问题
                client.set(req.body.username, token);
                console.log('存token进redis');

                res.json({
                    message: '登录成功',
                    idAdmin: doctorInformation.isAdmin,
                    doctorid: doctorInformation._id,
                    name:doctorInformation.name,
                    age: doctorInformation.age,
                    sex: doctorInformation.sex,
                    rank: doctorInformation.rank,
                    office: doctorInformation.office,
                    detail: doctorInformation.detail,
                    specialize: doctorInformation.specialize,
                    token
                })
            } else {
                res.status(400).json({
                    message: '密码错误',
                })
            }
        } else {
            res.status(400).json({
                message: '用户名不存在'
            })
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: '用户名不存在'
        })
    }
})

doctors.delete("/sessions",async (req, res, next)=>{
    client.del(req.username,function(err,reply){
        if (err) return false;
        console.log(reply);
    });
    console.log("登出，将redis里token删除");
    res.send({message: "登出"});
})

//根据检索条件找医生(姓名模糊筛选)
doctors.get("/", function (req, res) {
    var id = url.parse(req.url, true).query;
    if (req.identity == 1) {
        model = usermodel;
    } else if (req.identity == 2) {
        model = doctormodel;
    } else if (req.identity == 3) {
        model = adminmodel;
    } else {
        res.status(400).send({ message: "错误" });
    }
    //console.log(url.parse(req.url, true).query.Did);
    if (id['name']) {
        id['name'] = new RegExp(req.query.name);
    }
    Docotor.find(id, model,
        function (err, result) {
            //console.log(result);
            res.send(result);
    });
})

//根据_id找医生
doctors.get("/:id", function (req, res) {
    //var name = url.parse(req.url, true).pathname;
    //name = name.substr(1);
    console.log(req.params.id);

    if (req.identity == 1) {
        model = usermodel;
    } else if (req.identity == 2) {
        model = doctormodel;
    } else if (req.identity == 3) {
        model = adminmodel;
    } else {
        res.status(400).send({ message: "错误" });
    }
    Docotor.find({ '_id': req.params.id }, model,
        function (err, result) {
            //console.log(result);
            res.send(result);
    });
})

//添加新医生
doctors.post("/", function (req, res) {
    console.log(req.body.username);
    //var reponse=JSON.parse(res);
    if (req.body.username) {
        Docotor.insertDoctor(req.body, function (err) {
            // console.log(result);
            //res.send(result);
            if (err) {
                if (err.code == 11000) {
                    res.status(400).send({ message: "用户名重复" });
                }
                else {
                    console.log(err);
                    res.status(400).send({
                        message: err
                    });
                }
            } else {
                res.send({ message: "添加成功" });
            }
        })
    } else {
        res.status(400).send({ message: "没有用户名" });
    }
})

//删除医生信息
doctors.delete("/", function (req, res) {
    console.log(req.body);
    ids = req.body;
    Docotor.deleteMany({ _id: { $in: ids } }, function (err, result) {
        res.send(result);
    })
})

//删除医生信息
doctors.delete("/:id", function (req, res) {
    console.log(req.params.id);
    Docotor.remove({ _id: req.params.id }, function (err, result) {
        res.send(result);
    })
})

//更改医生信息
doctors.patch("/:id", function (req, res) {
    console.log(req.body);
    Docotor.find({ _id: req.params.id }, function (err, result) {
        if (result.length) {
            Docotor.updateOne({ _id: req.params.id }, req.body, function (err, result) {
                if (err) {
                    console.log(err);
                }
                res.send(result);
            })
        } else {
            // console.log("医生已存在")
            res.send({ message: "医生已存在" });
        }
    })
})
//更改医生信息
doctors.put("/:id", function (req, res) {
    console.log(req.body);
    Docotor.find({ _id: req.params.id }, function (err, result) {
        if (result.length) {
            Docotor.updateOne({ _id: req.params.id }, req.body, function (err, result) {
                if (err) {
                    console.log(err);
                }
                res.send(result);
            })
        } else {
            // console.log("医生已存在")
            res.send({ message: "医生已存在" });
        }
    })
})

//更改医生信息
doctors.patch("/", function (req, res) {
    console.log(req.body);
    Docotor.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})
//更改医生信息
doctors.put("/", function (req, res) {
    console.log(req.body);
    Docotor.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

module.exports = doctors;