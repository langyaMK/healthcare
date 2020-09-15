var express = require('express');
var prescriptions = express.Router();
const url = require('url');
var ObjectId = require('mongodb').ObjectId

var Prescription = require("../model/prescription.js");

var showmodel = {_id:1,registerid:1,libraryid:1,ispaid:1,number:1};
//根据检索条件找处方单
prescriptions.get("/",async(req,res) => {
    var id = url.parse(req.url, true).query;
     //console.log(url.parse(req.url, true).query.Did);
    /*if(id['Oname']){
        id['Oname']=new RegExp(req.query.Oname);
    }*/
    // Prescription.find(id, showmodel, 
    //     function (err, result) {
    //      //console.log(result);
    //     res.send(result);
    // });
    if(id.registerid){
        id.registerid = ObjectId(id.registerid);
    }
    if(id.libraryid){
        id.libraryid = ObjectId(id.libraryid);
    }

    // 显示聚合药品库的相关信息
    let result = await Prescription.aggregate([
        {
            $match: id
        },
        {   // 操作的Model为Prescription
            $lookup: {
                from: "libraries", // 数据库中关联的集合名
                localField: "libraryid", // prescription文档中关联的字段
                foreignField: "_id", // library文档中关联的字段
                as: "library" // 返回数据的字段名
            }
        },
        
        // {
        //     $group: {
        //         _id: "ispaid",
        //         total: {$sum: "$price"}
        //     }
        // },
        // {
        //     $project: {
        //         prescription: {

        //         }
        //     }
        // }
    ]);
    res.send(result);

})

//根据_id找处方单
prescriptions.get("/:id",function(req,res){
    //var name = url.parse(req.url, true).pathname;
    //name = name.substr(1);

     console.log(req.params.id);
    Prescription.find({'_id':req.params.id}, showmodel, 
    function (err, result) {
         //console.log(result);
        res.send(result);
    });
})
//添加新处方单
// prescriptions.post("/", function (req, res) {
//     console.log(req.body.patientid);
//     //var reponse=JSON.parse(res);
    
//     Prescription.insertPrescription(req.body, function (err) {
//         // console.log(result);
//         //res.send(result);
//         if (err) {
//             if (err.code == 11000) {
//                 res.status(400).send({ message: "处方单名重复" });
//             }
//             else {
//                 console.log(err);
//                 res.status(400).json({ message: err.message });
//             }
//         } else {
//             res.send("添加成功");
//         }
//     })
// })

//删除处方单信息
prescriptions.delete("/:id",function(req,res){
    //console.log(req.params.id);
    Prescription.remove({'_id':req.params.id},function(err,result){
        res.send(result);
    })

})

//更改处方单信息
prescriptions.post("/",function(req,res){
    console.log(req.body);//body含有registerid 和libraryid\
    var number = 1;
    if(req.body.num){
        number = req.body.num;
        delete req.body.num;
        console.log(number);
    }
    // req.num = 1;
    
    Prescription.update(req.body,{"$inc":{"number":number}},{upsert:true},function(err,result){
        if(err){
            console.log(err);
        }
        res.send(result);
    })

    // Prescription.updateOne(req.body[0], req.body[1],function(err,result){
    //     if(err){
    //         console.log(err);
    //     }
    //     res.send(result);
    // })
})

//更改处方单信息
prescriptions.put("/",function(req,res){
    console.log(req.body);
    Prescription.updateOne(req.body[0], req.body[1],function(err,result){
        if(err){
            console.log(err);
        }
        res.send(result);
    })
})

module.exports = prescriptions;