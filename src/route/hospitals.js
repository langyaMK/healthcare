var express = require('express');
var hospitals = express.Router();
// const url = require('url');
var Hospital = require('../model/hospital.js');

//更改医院信息
hospitals.patch("/",function (req, res) {
    // var id = url.parse(req.url, true).query;
    console.log(req.body)
    Hospital.updateOne({}, {"$set":{"detail": req.body.detail}}, {upsert:true}, function(err,result){
        if(err){
            console.log(err);
        }
        console.log(result);
        console.log(result.detail);
        res.send(result.detail);
    })
})

//获得医院信息
hospitals.get("/", function (req, res) {
    Hospital.findOne({}, function (err, result) {
        //console.log(result);
        if(err){
            console.log(err);
        }else{
            console.log(result);
            console.log(result.detail);
            res.send(result.detail);
        }
    });
})

module.exports = hospitals;