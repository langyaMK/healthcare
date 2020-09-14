var express = require('express');
var schedules = express.Router();
const url = require('url');

var Schedule = require("../model/schedule.js");

var showmodel = {_id:1,doctor:1,date:1,office:1};

function convertKey(arr,keyMap){
    let tempString = JSON.stringify(arr);
    // console.log(tempString)
    var key
    for( key in keyMap){
        var reg = `/"${key}":/g`;
        tempString = tempString.replace(eval(reg),'"'+keyMap[key]+'":');
    }
    // console.log(tempString);
    return JSON.parse(tempString);
}
//根据检索条件找排班表 并返回医生信息
schedules.get("/",async (req,res) =>{
    var id = url.parse(req.url, true).query;
    // id = JSON.parse(id);
    
    // console.log(id.name)
    // if (id.rank) {
    //     // console.log(id);
    //     id = convertKey(id,{'rank':'doctor.rank'});
    //     // id.doctor = {name: id.name};
    //     // delete id.name;
    //     // console.log(id)
    //     // console.log("somsdf",req.query)
    //     console.log(id)
    //     id['doctor.rank'] = new RegExp(req.query.rank);
    //     // console.log(id.doctor.name)
        
    // }
    // if (id.name) {
    //     // console.log(id);
    //     id = convertKey(id,{'name':'doctor.name'});
    //     // id.doctor = {name: id.name};
    //     // delete id.name;
    //     // console.log(id)
    //     // console.log("somsdf",req.query)
    //     console.log(id)
    //     id['doctor.name'] = new RegExp(req.query.name);
    //     // console.log(id.doctor.name)
        
    // }
    if (id['doctor.name']) {
        id['doctor.name'] = new RegExp(id['doctor.name'])
    }


    if (id.date) {
        id.date = JSON.parse(id.date)
        Object.keys(id.date).forEach(key => {
            console.log(key)
            id.date[key] = new Date(id.date[key])
        })
        // console.log(id);
    }
    // id[doctor.name] = new RegExp(id[doctor.name]);
    console.log(id);
     //id = JSON.stringify(id);
     //console.log(JSON.stringify(id));
    if(JSON.stringify(id)=="{}"){
        console.log("进到了奇怪的地方")
        Schedule.find(id, showmodel, 
            function (err, result) {
             //console.log(result);
            res.send(result);
        });
    }else{
        console.log("正常aggregate")
        let result = await Schedule.aggregate([
            { // 操作的Model为Schedule
                $lookup: {
                from: "doctors", // 数据库中关联的集合名
                localField: "doctor", // schedules文档中关联的字段
                foreignField: "_id", // doctors文档中关联的字段
                as: "doctor" // 返回数据的字段名
                }
            },{
                $match:id
            },
            {
                $project: {
                    doctor:{
                        username: 0,
                        password: 0,
                        isAdmin: 0
                    }     
                }
            }
        ]);
        console.log(result);
        res.send(result)
        
    }
});

//根据_id找排班表
schedules.get("/:id",function(req,res){
    //var name = url.parse(req.url, true).pathname;
    //name = name.substr(1);
    console.log(req.params.id);
    Schedule.find({'_id':req.params.id}, showmodel, 
    function (err, result) {
        console.log(result);
        res.send(result);
    });
    

})

//添加新排班表
schedules.post("/",function(req,res){
     console.log(req.body);
     //var reponse=JSON.parse(res);
    Schedule.insertSchedule(req.body,function(err){
        // console.log(err);
        if (err) {
            if (err.code == 11000) {
                res.status(400).send({ message: "出现重复" });
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
})

//删除排班表信息
schedules.delete("/:id",function(req,res){
    //console.log(req.params.id);
    Schedule.remove({'_id':req.params.id},function(err,result){
        res.send(result);
    })

})

//更改排班表信息
schedules.patch("/",function(req,res){
    console.log(req.body);
    Schedule.updateOne(req.body[0], req.body[1],function(err,result){
        if(err){
            console.log(err);
        }
        res.send(result);
    })
})

//更改排班表信息
schedules.put("/",function(req,res){
    console.log(req.body);
    Schedule.updateOne(req.body[0], req.body[1],function(err,result){
        if(err){
            console.log(err);
        }
        res.send(result);
    })
})

module.exports = schedules;