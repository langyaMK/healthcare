var express = require('express');
var anamneses = express.Router();
const url = require('url');
var ObjectId = require('mongodb').ObjectId


var Anamnesis = require("../model/anamnesis.js");
var showmodel = { openid: 1, registerid: 1, advice: 1, diagnosis: 1, statement: 1 };

//根据检索条件找病历表
anamneses.get("/", function (req, res) {
    var id = url.parse(req.url, true).query;
    Anamnesis.find(id, showmodel,
        function (err, result) {
            //console.log(result);
            res.send(result);
        });
})

//根据_id找病历表
anamneses.get("/:id", function (req, res) {
    console.log(req.params.id);
    Anamnesis.find({ _id: req.params.id }, showmodel,
        function (err, result) {
            //console.log(result);
            res.send(result);
        });
})

//添加新病历表
anamneses.post("/", function (req, res) {
    console.log(req.body);
    //var reponse=JSON.parse(res);
    Anamnesis.create(req.body, function (err, result) {
        //console.log(result);
        res.send(result);
    });
})

//删除病历表信息
anamneses.delete("/:id", function (req, res) {
    //console.log(req.params.id);
    Anamnesis.remove({ _id: req.params.id }, function (err, result) {
        res.send(result);
    })

})

//删除病历表信息
anamneses.delete("/", function (req, res) {
    console.log(req.body);
    ids = req.body;
    Anamnesis.deleteMany({ _id: { $in: ids } }, function (err, result) {
        res.send(result);
    })
})

//更改病历表信息
anamneses.patch("/", function (req, res) {
    console.log(req.body);
    Anamnesis.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})
//更改病历表信息
anamneses.put("/", function (req, res) {
    console.log(req.body);
    Anamnesis.updateMany(req.body[0], req.body[1], function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//更改病历表信息
anamneses.patch("/:id", function (req, res) {
    console.log(req.body);
    Anamnesis.updateOne({ _id: req.params.id }, req.body, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})

//更改病历表信息
anamneses.put("/:id", function (req, res) {
    console.log(req.body);
    Anamnesis.updateOne({ _id: req.params.id }, req.body, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })

})
module.exports = anamneses;