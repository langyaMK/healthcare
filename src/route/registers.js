var express = require('express');
var registers = express.Router();
var request = require('request');
const url = require('url'); 
var querystring = require("querystring");
var ObjectId = require('mongodb').ObjectId

var Register = require("../model/register.js");
var Prescription = require("../model/prescription.js");

var TokenService = require("../TokenService.js");
var TEMPLATE_ID = "Ij2uH1mf2tuqPXy5kzLPBVuF37ttW6Tzsm4Sdvqxo-s";

var showmodel = { openid:1,name: 1,identityCode: 1,ioffice: 1, doctor: 1, date: 1, price: 1, type: 1 ,num :1};


//添加新挂号单
registers.post("/", async (req, res) =>{
    console.log(req.body);
    // req.body.date= new Date(req.body.date);
    var search ;
    if(req.body.doctorid){
        search.doctorid = req.body.doctorid;
    }
    //var reponse=JSON.parse(res);
    search.date =new Date(search.date);
    var year = search.date.getFullYear();
    var month = search.date.getMonth();//月份返回0-11
    var date = search.date.getDate();
    console.log(search.date);
    // console.log(d.getDate());
    // console.log(year+'/'+month+'/'+date);
    var start = new Date(year,month,date);
    console.log(start);
    var end = new Date(year,month,date+1);
    search.date = { "$gte" : start , "$lt" : end};
    console.log(search.date);
    // req.body.date = d.getFullYear()+'/'+d.getMonth()+'/'+d.getDate();
    let registerNum = await Register.countDocuments(search,(err,count)=>{
        if(!err){
            console.log('查询条数成功！ 一共：' + count + '条');
        }else{
            throw err;
        }
    })
    registerNum += 1;
    console.log("Num "+ registerNum );

    req.body.num = registerNum ;
    req.body.openid = req.username;
    console.log(req.body);
    let data = await Register.create(req.body);

    console.log("regInf" + data);
    var libraryid = "5f59f626ca654936da9a627e";
    if(data.type){
        libraryid = "5f59f64bca654936da9a627f";
    }

    Prescription.create({"libraryid": libraryid,"registerid":data._id},function (err, result) {
        console.log(result);
        // res.send(result);
    });
    res.send("添加成功");
})

//发送通知
registers.post("/notifications", async (req, res) =>{
    console.log(req.body);
    var access_token = await TokenService.getAccessToken();
    var date = new Date(); 
    var param = {
        "access_token": access_token
    };
    console.log(param)
    let requestData = {
        "touser": req.username,
        "template_id": TEMPLATE_ID,
        // "page": "index",//TODO
        "miniprogram_state":"developer",
        "lang":"zh_CN",
        "data": {
            "time2": {
                "value": "2020年8月5日"
            },
            "thing3": {
                "value": "到你了"
            },
            "thing4": {
                "value": req.body.number 
            }
        }
    }
    var options = {
        method: "post",
        url: "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?" + querystring.stringify(param),
        body: JSON.stringify(requestData)
    };
    console.log(options)
    //let result = await request.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`).send(requestData).set('Accept', 'application/json');
    let result = request(options, (err, response, body) => {
        // console.log(`res.body ${res.body}`);
        if (!err && response.statusCode == 200) {
            //输出返回的内容
            console.log(body);
        }
    })
    // console.log(result);

    res.send(result);
})

//根据检索条件找挂号单
registers.get("/", async (req, res) => {
    var id = url.parse(req.url, true).query;
    // var date = new date();
    // var year = date.getFullYear();
    // var month = date.getMonth()+1;//月份返回0-11
    // var today = date.getDate();
    // console.log(today);
    // console.log(year+'/'+month+'/'+date);
    // var start = new Date(year+'/'+month+'/'+today);
    // var end = new Date(year+'/'+month+'/'+(today+1));
    // should= { "$gte" : start , "$lt" : end};
    // console.log(should);
    

    if (req.identity == 1) {//病人接口
        id.openid = req.username;
        if (id.date) {
            id.date = JSON.parse(id.date)
            Object.keys(id.date).forEach(key => {
                console.log(key)
                id.date[key] = new Date(id.date[key])
            })
        // console.log(id);
        }
        let result = await Register.aggregate([
            {
                $match:id
            },
            { // 操作的Model为Prescription
                $lookup: {
                from: "prescriptions", // 数据库中关联的集合名
                localField: "_id", // registers文档中关联的字段
                foreignField: "registerid", // prescriptions文档中关联的字段
                as: "prescriptions" // 返回数据的字段名
                }
            },
            {
                $unwind:"$prescriptions",
            },
            { // 操作的Model为Library
                $lookup: {
                from: "libraries", // 数据库中关联的集合名
                localField: "prescriptions.libraryid", // registers文档中关联的字段
                foreignField: "_id", // libearies文档中关联的字段
                as: "libraries" // 返回数据的字段名
                }
            },
            {
                $unwind:"$libraries"
            },
            {
                $project: {
                    openid: 0,
                    doctorid : 0,
                    __v:0,
                    prescriptions:{
                        registerid: 0,
                        libraryid: 0,
                        __v : 0
                    },
                    libraries:{
                        __v:0
                    }
                }
            },
            // {
            //     $group : {
            //         _id : "$_id",
            //         office: "$office",
            //         doctor: "$doctor",
            //         date :"$date",
            //         price:"$price",
            //         type:"%type",
            //         num :"$num",

            //     }
            // }
        ]);
        console.log(result);
        var registrations ={}
        var resultArr=[]
        result.forEach((element,index)=>{
            element.prescriptions.type=element.libraries.type;
            element.prescriptions.name=element.libraries.name;
            element.prescriptions.price=element.libraries.price;
            element.prescriptions.item_id=element.libraries._id;
            delete element.libraries;
            if(registrations[element._id]){
            //   console.log("第二部分也同样插入");
              
              registrations[element._id].prescriptions.push(element.prescriptions);
            }else{
                element.prescriptions=[element.prescriptions];
                registrations[element._id] = {};
                Object.keys(element).forEach((key)=>{
                    registrations[element._id][key] = element[key];
                })
            }
        })
        Object.keys(registrations).forEach((key)=>{
            resultArr.push(registrations[key])
        })
        console.log(registrations);
        
        res.send(resultArr)
    } else if(req.identity == 2||req.identity == 3 ){

        if(id.isToday){
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth();//月份返回0-11
            var day = date.getDate();
            var start = new Date(year,month,day);
            var end = new Date(year,month,day+1);
            console.log(start);
            // end = end.setDate(end.getDate()+1);
            console.log(end);
            id.date = { "$gte" : start , "$lt" : end};
        }
        delete id.isToday;
        // delete id.date
        if(id.doctorid){
            id.doctorid = ObjectId(id.doctorid);
        }
        console.log("registers ",id)
        
        let result = await Register.aggregate([
            {
                $match: id
            }
            ,
            { // 操作的Model为Registers
                $lookup: {
                    from: "patients", // 数据库中关联的集合名
                    localField: "openid", // Registers文档中关联的字段
                    foreignField: "openid", // prescriptions文档中关联的字段
                    as: "patients" // 返回数据的字段名
                }
            }
            // {
            //     $unwind: "$registers",
            // },
            // {
            //     $project: {
            //         openid: 0,
            //         doctorid: 0,
            //         __v: 0,
            //         prescriptions: {
            //             registerid: 0,
            //             libraryid: 0,
            //             __v: 0
            //         },
            //         libraries: {
            //             __v: 0
            //         }
            //     }
            // },

        ]);
            // }else{
            //     Register.find(id, showmodel,
            //         function (err, result) {
            //             //console.log(result);
            //             res.send(result);
            //         });
            // }
        console.log(result)
        res.send(result)
    // } else if( req.identity == 3) {
    //     Register.find(id, showmodel, 
    //             function (err, result) {
    //             //console.log(result);
    //             res.send(result);
    //         });
    } else {
        res.status(400).send({ message: "错误" });
    }
})

//根据_id找挂号单
registers.get("/:id", function (req, res) {
    //var name = url.parse(req.url, true).pathname;
    //name = name.substr(1);

    console.log(req.params.id);
    Register.find({ _id: req.params.id }, showmodel,
        function (err, result) {
            //console.log(result);
            res.send(result);
        });
})

//根据_id删除挂号单信息
registers.delete("/:id", function (req, res) {
    //console.log(req.params.id);
    Register.remove({ _id: req.params.id }, function (err, result) {
        res.send(result);
    })

})

//根据检索条件删除挂号单信息
registers.delete("/", function (req, res) {
    console.log(req.body);
    ids = req.body;
    Register.deleteMany({ _id: { $in: ids } }, function (err, result) {
        res.send(result);
    })
})

//根据检索条件使用patch更改挂号单信息
registers.patch("/", function (req, res) {
    console.log(req.body);
    Register.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//根据检索条件使用put更改挂号单信息
registers.put("/", function (req, res) {
    console.log(req.body);
    Register.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//根据_id使用patch更改挂号单信息
registers.patch("/:id", function (req, res) {
    console.log(req.body);
    Register.updateOne({ _id: req.params.id }, req.body, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//根据_id使用put更改挂号单信息
registers.put("/:id", function (req, res) {
    console.log(req.body);
    Register.updateOne({ _id: req.params.id }, req.body, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })

})
module.exports = registers;